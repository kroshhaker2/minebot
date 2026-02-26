module.exports = (bot) => {
    bot.on('chat', (username, message) => {
        if (message.startsWith('!echo ')) {
            const text = message.slice(6);
            bot.chat(text);
        }
    });
};