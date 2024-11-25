const { EmbedBuilder, AuditLogEvent, time } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup'); // Importar GuildSetup
const messages = require('./messages/channelDelete'); // Importar mensajes

module.exports = {
    name: 'channelDelete',
    async execute(client, channel) {
        if (!channel.guild) return;

        // Obtener configuración del servidor
        const guildSetup = await GuildSetup.findOne({ guildId: channel.guild.id });
        if (!guildSetup || !guildSetup.isSetupComplete) return;

        const lang = guildSetup.language || 'en'; // Determinar idioma

        // Obtener configuración de logs
        const logSettings = await LogSettings.findOne({ guildId: channel.guild.id });
        if (!logSettings || !logSettings.channelDeleteEnabled || !logSettings.channelDeleteChannelId) return;

        const logChannel = channel.guild.channels.cache.get(logSettings.channelDeleteChannelId);
        if (!logChannel) return;

        // Obtener registros de auditoría
        let executorTag = messages[lang].unknown;
        try {
            const auditLogs = await channel.guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelDelete,
                limit: 1,
            });
            const deletionLog = auditLogs.entries.first();
            if (deletionLog) {
                executorTag = deletionLog.executor?.tag || messages[lang].unknown;
            }
        } catch (error) {
            console.error('Error al obtener registros de auditoría:', error);
        }

        // Validar datos del canal
        const channelName = channel.name || messages[lang].unnamed;
        const channelId = channel.id || messages[lang].unavailable;
        const Time = time(new Date());

        // Crear embed multilenguaje
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle(messages[lang].title)
            .setDescription(messages[lang].description.replace('{channelName}', channelName))
            .addFields(
                { name: messages[lang].channelName, value: `\`\`\`${channelName}\`\`\`` },
                { name: messages[lang].channelId, value: `\`\`\`${channelId}\`\`\`` },
                { name: messages[lang].deletedBy, value: executorTag, inline: true },
                { name: messages[lang].deletedAt, value: Time, inline: true }
            )
            .setTimestamp();

        // Enviar embed al canal configurado
        logChannel.send({ embeds: [embed] });
    },
};
