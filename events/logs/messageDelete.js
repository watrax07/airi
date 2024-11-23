const { EmbedBuilder, AuditLogEvent, channelMention, time, userMention } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
module.exports = {
    name: 'messageDelete',
    async execute(client, message) {
        
        if (!message.guild) {
            return;
        }

        const logSettings = await LogSettings.findOne({ guildId: message.guild.id });
        if (!logSettings) {
            return;
        }

        if (logSettings.messageDeleteEnabled && logSettings.messageDeleteChannelId) {
            const logChannel = message.guild.channels.cache.get(logSettings.messageDeleteChannelId);
            if (!logChannel) {
                return;
            }
            const auditLogs = await message.guild.fetchAuditLogs({
                type: AuditLogEvent.MessageDelete, 
                limit: 1
                
            });

            const createLog = auditLogs.entries.first();
            const executor = createLog ? createLog.executor : null;
            const executorTag = executor ? executor.tag : `Desconocido`;
            const channelTag =  channelMention(message.channel.id);
            const date = new Date();
            const Time = time(date); 
            const Content =  message.content.length > 0 ? `${message.content}` : 'Mensaje sin contenido visible';



            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚫 Mensaje Eliminado')
                .setDescription(`Un mensaje de **${message.author.tag}** fue eliminado en **${message.channel.name}**.`)
                .addFields(
                    { name: 'Contenido', value:  `\`\`\`${Content}\`\`\`` ||  `\`\`\`Contenido no visible\`\`\`` },
                    { name: `Responsable`, value:  `\`\`\`${executorTag}\`\`\`` ||  `\`\`\`Contenido no visible\`\`\``},
                    { name: `Mensaje eliminado a las:`, value: Time, inline:true},
                    { name: 'Mensaje elminado en:', value: channelTag, inline: true }
                )
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }
    },
};

// mia