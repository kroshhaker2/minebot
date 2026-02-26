// набросок

require('dotenv').config();
const mineflayer = require('mineflayer');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');

// === Создаем бота ===
const bot = mineflayer.createBot({
    host: '192.168.1.118',      // IP сервера Minecraft
    port: 4242,            // Порт сервера
    username: 'Furry',    // Ник бота
    version: '1.21.8'
});

// Логирование событий
bot.on('login', () => console.log('Бот подключился к серверу'));
bot.on('spawn', () => console.log('Бот заспавнился в мире'));
bot.on('error', err => console.error('Ошибка бота:', err));
bot.on('end', () => console.log('Бот отключился'));

// === Загрузка плагинов ===
fs.readdirSync('./plugins').forEach(file => {
    const plugin = require(`./plugins/${file}`);
    if (typeof plugin === 'function') plugin(bot);
});

// === Обработка чата и AI ответов ===
bot.on('chat', async (username, message) => {
    if (username === bot.username) return;

    console.log(`${username}: ${message}`);

    // Проверка на команду /say
    if (message.startsWith('/say ')) {
        const text = message.slice(5);
        bot.chat(text);
        return;
    }

    // ИИ ответ через OpenRouter
    const reply = await getAIReply(message);
    if (reply) bot.chat(reply);
});

// === Функция общения с OpenRouter API ===
async function getAIReply(message) {
    try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: message }]
            }),
        });

        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
    } catch (err) {
        console.error('Ошибка OpenRouter:', err);
        return null;
    }
}