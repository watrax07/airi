const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generarbot')
        .setDescription('Genera un bot de Discord con el token proporcionado')
        .addStringOption(option =>
            option.setName('token')
                .setDescription('El token del bot')
                .setRequired(true)),
    async execute(interaction) {
        const token = interaction.options.getString('token');
        
        // Nombre de la carpeta donde se creará el bot
        const projectDir = path.join(__dirname, 'nuevo-bot');
        
        // Contenido del archivo bot.js
        const botCode = `
        const { Client, GatewayIntentBits } = require('discord.js');
        const client = new Client({ intents: [GatewayIntentBits.Guilds] });

        client.once('ready', () => {
            console.log('Bot is ready!');
        });

        client.login('${token}');
        `;

        // Contenido de package.json
        const packageJson = {
            name: "nuevo-bot",
            version: "1.0.0",
            description: "Un bot de Discord generado automáticamente",
            main: "bot.js",
            scripts: {
                start: "node bot.js"
            },
            dependencies: {}
        };

        // Crear el directorio del bot
        fs.mkdirSync(projectDir, { recursive: true });

        // Crear el archivo bot.js
        fs.writeFileSync(path.join(projectDir, 'bot.js'), botCode);

        // Crear el archivo package.json
        fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));

        // Responder en Discord antes de instalar las dependencias
        await interaction.reply('Bot generado. Instalando dependencias...');

        // Instalar discord.js dentro del nuevo directorio
        exec('npm install discord.js', { cwd: projectDir }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error durante la instalación: ${error}`);
                return interaction.followUp('Hubo un error al instalar discord.js.');
            }

            // Confirmar instalación y dar instrucciones para ejecutar el bot
            interaction.followUp('Dependencias instaladas correctamente. Usa `npm start` dentro de la carpeta del bot para iniciarlo.');
        });
    }
};
