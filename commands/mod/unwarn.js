// commands/admin/unwarn.js
const GuildSetup = require('../../Schemas/guildSetup');
const Warning = require('../../Schemas/warning');
const messages = require('./messages/unwarn'); // Asegúrate de importar el archivo de mensajes

module.exports = {
    name: 'unwarn',
    description: 'Elimina una advertencia de un miembro del servidor.',
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

        // Verifica que se proporcione el número de advertencia a eliminar
        if (!args[1]) {
            const lang = guild.language; // Obtener el idioma configurado
            return message.reply(messages[lang].noWarnNumber); // Mensaje de falta de número de advertencia
        }

        const warnNumber = parseInt(args[1]) - 1; // Restar 1 para indexar correctamente

        if (isNaN(warnNumber)) {
            const lang = guild.language; // Obtener el idioma configurado
            return message.reply(messages[lang].invalidNumber); // Mensaje de número inválido
        }

        try {
            // Obtén todas las advertencias del usuario
            const warnings = await Warning.find({ GuildId: message.guild.id, UserId: user.id });

            // Verifica que la advertencia especificada exista
            if (warnNumber < 0 || warnNumber >= warnings.length) {
                return message.reply(messages[lang].warnNotFound.replace('{user}', user.user.tag).replace('{warnNumber}', args[1])); // Mensaje de advertencia no encontrada
            }

            // Elimina la advertencia específica
            await Warning.deleteOne({ GuildId: message.guild.id, UserId: user.id, Reason: warnings[warnNumber].Reason });
            const lang = guild.language; // Obtener el idioma configurado
            message.reply(messages[lang].unwarnSuccess.replace('{user}', user.user.tag).replace('{warnNumber}', args[1])); // Mensaje de éxito
        } catch (error) {
            console.error(error);
            const lang = guild.language; // Obtener el idioma configurado
            message.reply(messages[lang].unwarnError); // Mensaje de error
        }
    },
};
