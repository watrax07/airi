// handlers/commandHandler.js
const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const commandsFolder = path.join(__dirname, '../commands');
    
    const subcarpetas = fs.readdirSync(commandsFolder).filter(f => fs.statSync(path.join(commandsFolder, f)).isDirectory());
    const commandList = [];

    subcarpetas.forEach(subcarpeta => {
        const subcarpetaPath = path.join(commandsFolder, subcarpeta);
        const archivos = fs.readdirSync(subcarpetaPath).filter(f => f.endsWith('.js'));

        archivos.forEach(file => {
            const command = require(path.join(subcarpetaPath, file));

            if (command.name && command.execute) {
                client.commands.set(command.name, command);
                commandList.push({ Emoji: '✅', Comando: command.name }); // Separar el emoji del nombre
            } else {
                console.error(`❌ El comando en **${file}** no tiene las propiedades necesarias.`);
            }
        });
    });

    // Imprimir la tabla sin índice
    console.table(commandList);
};
