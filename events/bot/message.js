const GuildSetup = require('../../Schemas/guildSetup'); // Asegúrate de que la ruta sea correcta

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(client, message) {
        // Ignora los mensajes que no son de usuarios o que no contienen el prefijo
        if (message.author.bot) return;

        // Obtiene la configuración del servidor desde la base de datos
        const guildId = message.guild.id;
        let guild = await GuildSetup.findOne({ guildId: guildId });

        // Usa el prefijo predeterminado si no hay configuración en la base de datos
        const prefix = guild ? guild.prefix : '!'; // Prefijo por defecto es '!'

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);

        if (!command) return;

        // Verifica si el comando es solo para el propietario
        if (command.owner && message.author.id !== '1220904035947778280') {
            return message.reply('No tienes permisos para usar este comando.');
        }

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            await message.reply('Hubo un error al intentar ejecutar el comando.');
        }
    },
};
