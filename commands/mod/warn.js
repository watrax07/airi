// commands/admin/warn.js
const GuildSetup = require('../../Schemas/guildSetup');
const Warning = require('../../Schemas/warning');
const messages = require('./messages/warn'); // Asegúrate de importar el archivo de mensajes

module.exports = {
    name: 'warn',
    description: 'Advierte a un miembro del servidor.',
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
        const reason = args.slice(1).join(' ') || messages[guild.language].noReason; // Usar mensaje de razón por defecto

        const warning = new Warning({
            GuildId: message.guild.id,
            UserId: user.id,
            Reason: reason,
        });

        try {
            await warning.save();
            const lang = guild.language; // Obtener el idioma configurado
            message.reply(messages[lang].warnSuccess.replace('{user}', user.user.tag).replace('{reason}', reason)); // Mensaje de éxito
        } catch (error) {
            console.error(error);
            const lang = guild.language; // Obtener el idioma configurado
            message.reply(messages[lang].warnError); // Mensaje de error
        }
    },
};
