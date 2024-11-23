const { EmbedBuilder, channelMention, time, AuditLogEvent } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');

module.exports = {
    name: 'channelCreate',
    async execute(client, channel) {

        if (!channel.guild) return;

        const logSettings = await LogSettings.findOne({ guildId: channel.guild.id });
        if (!logSettings || !logSettings.channelCreateEnabled || !logSettings.channelCreateChannelId) return;

        const logChannel = channel.guild.channels.cache.get(logSettings.channelCreateChannelId);
        if (!logChannel) return;

        const auditLogs = await channel.guild.fetchAuditLogs({
            type: AuditLogEvent.ChannelCreate,
            limit: 1

        });
        const createLog = auditLogs.entries.first();
        const executor = createLog ? createLog.executor : null;
        const executorTag = executor ? executor.tag : `Desconocido`;

        // Asegúrate de validar correctamente los valores del canal
        const channelName = channel.name || 'Sin nombre';
        const channelId = channel.id || 'ID no disponible';
        const channelTag  = channelMention(channelId);
        const date = new Date();

        const  Time = time(date);
        
       

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Canal ha sido creado correctamente ✅')
            .setDescription(`El canal ${channelName}, Fue creado verifica su informacion<:arrow_down:1307882566841532427>`)
            .addFields(
                { name: 'Nombre del canal', value: `\`\`\`${channelName}\`\`\`` || `\`\`\`Contenido no visible\`\`\``},
                { name: 'ID del canal', value: `\`\`\`${channelId}\`\`\`` || `\`\`\`Contenido no visible\`\`\``},
                { name: `Creado por:`, value: executorTag, inline: true},
                { name: `Canal`, value: channelTag, inline: true },
                { name: `Hora`, value: Time, inline: true }
                
            )
            .setTimestamp()
            

        logChannel.send({ embeds: [embed] });
    },
};

// mia
