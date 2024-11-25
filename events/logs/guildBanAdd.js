const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup'); // Importar GuildSetup
const messages = require('./messages/guildBanAdd'); // Importar mensajes

module.exports = {
    name: 'guildBanAdd',
    async execute(client, ban) {
        if (!ban || !ban.guild || !ban.user) return;

        // Obtener configuración del servidor
        const guildSetup = await GuildSetup.findOne({ guildId: ban.guild.id });
        if (!guildSetup || !guildSetup.isSetupComplete) return;

        const lang = guildSetup.language || 'en'; // Determinar idioma del servidor

        // Obtener configuración de logs
        const logSettings = await LogSettings.findOne({ guildId: ban.guild.id });
        if (!logSettings || !logSettings.userBanEnabled || !logSettings.userBanChannelId) return;

        const logChannel = ban.guild.channels.cache.get(logSettings.userBanChannelId);
        if (!logChannel || !logChannel.permissionsFor(ban.guild.members.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) {
            console.error(messages[lang].noPermission);
            return;
        }

        // Obtener registros de auditoría
        let banLog;
        try {
            const auditLogs = await ban.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberBanAdd,
                limit: 1,
            });
            banLog = auditLogs.entries.find(entry => entry.target.id === ban.user.id);
        } catch (error) {
            console.error('Error al obtener los registros de auditoría:', error);
        }

        const reason = banLog?.reason || messages[lang].noReason;
        const executor = banLog?.executor
            ? `${banLog.executor.tag} (${banLog.executor.id})`
            : messages[lang].unknown;

        // Crear embed multilenguaje
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle(messages[lang].title)
            .setDescription(messages[lang].description.replace('{userTag}', ban.user.tag))
            .addFields(
                { name: messages[lang].userId, value: ban.user.id, inline: true },
                { name: messages[lang].reason, value: reason, inline: true },
                { name: messages[lang].executor, value: executor, inline: true }
            )
            .setTimestamp();

        // Enviar embed al canal configurado
        logChannel.send({ embeds: [embed] });
    },
};
