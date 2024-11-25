const { EmbedBuilder, channelMention, time, AuditLogEvent } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup'); // Importar GuildSetup
const messages = require('./messages/channelCreate'); // Importar mensajes

module.exports = {
    name: 'channelCreate',
    async execute(client, channel) {
        if (!channel.guild) return;

        // Obtener la configuración del servidor (GuildSetup)
        const guildSetup = await GuildSetup.findOne({ guildId: channel.guild.id });
        if (!guildSetup || !guildSetup.isSetupComplete) return; // Verificar si el servidor está configurado

        const lang = guildSetup.language || 'en'; // Determinar el idioma del servidor

        // Obtener configuración de logs
        const logSettings = await LogSettings.findOne({ guildId: channel.guild.id });
        if (!logSettings || !logSettings.channelCreateEnabled || !logSettings.channelCreateChannelId) return;

        const logChannel = channel.guild.channels.cache.get(logSettings.channelCreateChannelId);
        if (!logChannel) return;

        // Obtener registros de auditoría
        let executorTag = messages[lang].unknown || 'Unknown'; // Fallback en caso de que no haya mensaje configurado
        try {
            const auditLogs = await channel.guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelCreate,
                limit: 1,
            });
            const createLog = auditLogs.entries.first();
            if (createLog) {
                executorTag = createLog.executor?.tag || messages[lang].unknown;
            }
        } catch (error) {
            console.error('Error al obtener registros de auditoría:', error);
        }

        // Datos del canal
        const channelName = channel.name || messages[lang].unnamed || 'Unnamed';
        const channelId = channel.id || messages[lang].unavailable || 'Unavailable';
        const channelTag = channelMention(channelId);
        const Time = time(new Date());

        // Crear embed multilenguaje
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(messages[lang].title)
            .setDescription(messages[lang].description.replace('{channelName}', channelName))
            .addFields(
                { name: messages[lang].channelName, value: `\`\`\`${channelName}\`\`\`` },
                { name: messages[lang].channelId, value: `\`\`\`${channelId}\`\`\`` },
                { name: messages[lang].createdBy, value: executorTag, inline: true },
                { name: messages[lang].channelTag, value: channelTag, inline: true },
                { name: messages[lang].createdAt, value: Time, inline: true }
            )
            .setTimestamp();

        // Enviar embed al canal configurado
        logChannel.send({ embeds: [embed] });
    },
};
