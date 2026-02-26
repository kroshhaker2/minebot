module.exports = (bot) => {
    bot.on('chat', (username, message) => {
        if (message.toLowerCase() === 'hi') {
            bot.chat(`Привет, ${username}!`);
        }
    });
};