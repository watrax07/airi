const { EmbedBuilder, time,  AuditLogEvent } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
module.exports = {
    name: 'roleDelete',
    async execute(client, role) {

        if (!role.guild) {
            return;
        }

        const logSettings = await LogSettings.findOne({ guildId: role.guild.id });
        if (!logSettings) {
            return;
        }

        if (logSettings.roleDeleteEnabled && logSettings.roleDeleteChannelId) {
            const logChannel = role.guild.channels.cache.get(logSettings.roleDeleteChannelId);
            if (!logChannel) {
                return;
            }

            const auditLogs = await role.guild.fetchAuditLogs({
                type: AuditLogEvent.RoleDelete, 
                limit: 1
                
            });

            const  createLog = auditLogs.entries.first();
            const executor = createLog ? createLog.executor : null;
            const executorTag = executor ? executor.tag : `Desconocido`;

            const  date = new  Date();
            const Time = time(date)
            const nombre = role.name

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🛑 Rol Eliminado')
                .setDescription(`El rol **${role.name}** acaba de ser eliminado del servidor.`)
                .addFields(
                    { name: `Nombre del rol`, value: `\`\`\`${nombre}\`\`\`` || `\`\`\`Contenido no visible\`\`\``},
                    { name: 'ID del Rol', value: `\`\`\`${role.id}\`\`\`` || `\`\`\`Contenido no visible\`\`\``}, 
                    { name: 'Color', value: role.color.toString(16), inline: true },
                    { name: `Eliminado a las:`,  value: Time, inline: true},
                    { name: `Eliminado por`, value: executorTag, inline: true}
                )
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }
    },
};

// mia
