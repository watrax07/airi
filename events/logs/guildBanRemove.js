const { EmbedBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup'); // Importar GuildSetup
const messages = require('./messages/guildBanRemove'); // Importar mensajes

module.exports = {
    name: 'guildBanRemove',
    async execute(client, ban) {
        if (!ban || !ban.guild || !ban.user) return;

        // Obtener configuración del servidor
        const guildSetup = await GuildSetup.findOne({ guildId: ban.guild.id });
        if (!guildSetup || !guildSetup.isSetupComplete) return;

        const lang = guildSetup.language || 'en'; // Determinar idioma del servidor

        // Obtener configuración de logs
        const logSettings = await LogSettings.findOne({ guildId: ban.guild.id });
        if (!logSettings || !logSettings.userUnwarnEnabled || !logSettings.userUnwarnChannelId) return;

        const logChannel = ban.guild.channels.cache.get(logSettings.userUnwarnChannelId);
        if (!logChannel || !logChannel.permissionsFor(ban.guild.members.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) {
            console.error(messages[lang].noPermission);
            return;
        }

        // Crear embed multilenguaje
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(messages[lang].title)
            .setDescription(messages[lang].description.replace('{userTag}', ban.user.tag))
            .addFields({ name: messages[lang].userId, value: ban.user.id })
            .setTimestamp();

        // Enviar embed al canal configurado
        logChannel.send({ embeds: [embed] });
    },
};
