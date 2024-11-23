const { EmbedBuilder, AuditLogEvent, time } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');

module.exports = {
    name: 'channelDelete',
    async execute(client, channel) {

        if (!channel.guild) return;

        const logSettings = await LogSettings.findOne({ guildId: channel.guild.id });
        if (!logSettings || !logSettings.channelDeleteEnabled || !logSettings.channelDeleteChannelId) return;

        const logChannel = channel.guild.channels.cache.get(logSettings.channelDeleteChannelId);
        if (!logChannel) return;

        const auditLogs = await channel.guild.fetchAuditLogs({
            type: AuditLogEvent.ChannelDelete, 
            limit: 1
        });
        const deletionLog = auditLogs.entries.first();
        const executor = deletionLog ? deletionLog.executor : null;
        const executorTag = executor ? executor.tag : 'Desconocido';

        // Validar datos del canal
        const channelName = channel.name || 'Sin nombre';
        const channelId = channel.id || 'ID no disponible';
        const date = new Date();
        const Time = time(date);

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🗑️ Canal Eliminado')
            .setDescription(`El canal ${channelName},  Acaba de ser eliminado revisa su informacion  abajo<:arrow_down:1307882566841532427>`)
            .addFields(
                { name: 'Nombre del Canal',  value: `\`\`\`${channelName}\`\`\`` || `\`\`\`Contenido no visible\`\`\`` },
                { name: 'Id del canal',  value: `\`\`\`${channelId}\`\`\`` || `\`\`\`Contenido no visible\`\`\``},
                { name: 'Eliminado por:', value: executorTag, inline: true },
                { name: `Eliminado a las:`, value: Time, inline: true}
            )
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    },
};

// mia
