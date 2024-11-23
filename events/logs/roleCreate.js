const { EmbedBuilder, time, AuditLogEvent, roleMention } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
module.exports = {
    name: 'roleCreate',
    async execute(client, role) {

        if (!role.guild) {
            return;
        }

        const logSettings = await LogSettings.findOne({ guildId: role.guild.id });
        if (!logSettings) {
            return;
        }

        if (logSettings.roleCreateEnabled && logSettings.roleCreateChannelId) {
            const logChannel = role.guild.channels.cache.get(logSettings.roleCreateChannelId);
            if (!logChannel) {
                return;
            }

            const auditLogs = await role.guild.fetchAuditLogs({
                type: AuditLogEvent.RoleCreate, 
                limit: 1
                
            });

            const  createLog = auditLogs.entries.first();
            const executor = createLog ? createLog.executor : null;
            const executorTag = executor ? executor.tag : `Desconocido`;
            const nombre = role.name
            const idRole = role.id
          const  date = new Date();
          const Time = time(date)
          const roleTag = roleMention(idRole)

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎉 Nuevo Rol Creado')
                .setDescription(`Un nuevo rol llamado **${role.name}** acaba de ser creado en el servidor.`)
                .addFields(
                    { name: 'Nombre del rol', value: `\`\`\`${nombre}\`\`\`` || `\`\`\`Contenido no visible\`\`\``},
                    { name: `Id del rol`, value: `\`\`\`${idRole}\`\`\`` || `\`\`\`Contenido no visible\`\`\``},
                    { name: `Creado por:`, value: executorTag, inline: true},
                    { name: 'Color', value: role.color.toString(16), inline: true },
                    { name: 'Mencionar Rol', value: roleTag, inline: true },
                    { name: `Creado a las`, value: Time, inline: true}
                )
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }
    },
};

// mia
