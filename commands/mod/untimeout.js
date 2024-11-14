// commands/admin/untimeout.js
const GuildSetup = require('../../Schemas/guildSetup');
const messages = require('./messages/untimeout'); // Asegúrate de importar el archivo de mensajes

module.exports = {
    name: 'untimeout',
    description: 'Elimina el timeout de un miembro del servidor.',
    owner: false,
    category: 'Admin',
    async execute(message, args) {
        const guildId = message.guild.id;

        // Busca si el servidor ya completó la configuración
        const guild = await GuildSetup.findOne({ guildId: guildId });

        if (!guild || !guild.isSetupComplete) {
            const lang = guild ? guild.language : 'es'; // Usar español por defecto si no hay configuración
            return message.channel.send(messages[lang].setupRequired); // Mensaje de configuración requerido
        }

        const user = message.mentions.members.first();
        if (!user) {
            const lang = guild.language; // Obtener el idioma configurado
            return message.reply(messages[lang].mentionUser); // Mensaje de mencionar usuario
        }

        try {
            await user.timeout(null, `Timeout eliminado por un administrador.`);
            const lang = guild.language; // Obtener el idioma configurado
            message.reply(messages[lang].timeoutRemoved.replace('{user}', user.user.tag)); // Mensaje de éxito
        } catch (error) {
            console.error(error);
            const lang = guild.language; // Obtener el idioma configurado
            message.reply(messages[lang].timeoutError); // Mensaje de error
        }
    },
};
