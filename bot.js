// набросок


require('dotenv').config();
const mineflayer = require('mineflayer');
const memory = require('./memory');
const fs = require('fs');

// Если Node.js 18+ — встроенный fetch
const fetch = global.fetch || ((...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)));

// === Настройки бота ===
const bot = mineflayer.createBot({
    host: '192.168.1.118',      // IP сервера Minecraft
    port: 4242,            // Порт сервера
    username: 'Furry',    // Ник бота
    version: '1.21.8'
});

// === Логи ===
bot.on('login', () => console.log('Бот подключился'));
bot.on('spawn', () => console.log('Бот заспавнился'));
bot.on('end', (reason) => console.log('Бот отключился:', reason));
bot.on('kicked', (reason) => console.log('Бот был кикнут:', reason));
bot.on('error', (err) => console.log('Ошибка:', err));

// === Загрузка плагинов ===
if (fs.existsSync('./plugins')) {
    fs.readdirSync('./plugins').forEach(file => {
        const plugin = require(`./plugins/${file}`);
        if (typeof plugin === 'function') plugin(bot);
    });
}

// === Функция общения с OpenRouter AI ===
async function getAIReply(message, chatHistory) {
    try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    ...chatHistory.map(m => ({
                        role: m.username === bot.username ? 'assistant' : 'user',
                        content: m.message
                    })),
                    { role: "user", content: message }
                ]
            }),
        });

        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
    } catch (err) {
        console.error('Ошибка OpenRouter:', err);
        return null;
    }
}

// === Обработка чата ===
bot.on('chat', async (username, message) => {
    if (username === bot.username) return;

    playerMsg = `${username}: ${message}`;

    // Загружаем чат из памяти
    let chatHistory = memory.get('chatHistory') || [];

    // Сохраняем новое сообщение
    chatHistory.push({ username, message: playerMsg });
    memory.set('chatHistory', chatHistory);

    // Получаем AI-ответ с контекстом
    const reply = await getAIReply(message, chatHistory);
    if (reply) {
        bot.chat(reply);

        // Сохраняем ответ бота в память
        chatHistory.push({ username: bot.username, message: reply });
        memory.set('chatHistory', chatHistory);
    }
});