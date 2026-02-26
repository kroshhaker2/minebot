const fs = require('fs');
const path = require('path');

const memoryFile = path.join(__dirname, 'memory.json');

let memory = {};

function loadMemory() {
    if (fs.existsSync(memoryFile)) {
        try {
            memory = JSON.parse(fs.readFileSync(memoryFile, 'utf-8'));
        } catch (err) {
            console.error('Ошибка чтения memory.json:', err);
            memory = {};
        }
    }
}

function saveMemory() {
    try {
        fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
    } catch (err) {
        console.error('Ошибка записи memory.json:', err);
    }
}

function get(key) {
    return memory[key];
}

function set(key, value) {
    memory[key] = value;
    saveMemory();
}

loadMemory();

module.exports = { get, set, loadMemory, saveMemory };