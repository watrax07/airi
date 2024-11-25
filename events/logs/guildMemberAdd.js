const { EmbedBuilder, time, AuditLogEvent } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup'); // Importar GuildSetup
const messages = require('./messages/guildMemberAdd'); // Importar mensajes

module.exports = {
    name: 'guildMemberAdd',
    async execute(client, member) {
        if (!member.guild) return;

        // Obtener configuración del servidor
        const guildSetup = await GuildSetup.findOne({ guildId: member.guild.id });
        if (!guildSetup || !guildSetup.isSetupComplete) return;

        const lang = guildSetup.language || 'en'; // Determinar idioma

        // Obtener configuración de logs
        const logSettings = await LogSettings.findOne({ guildId: member.guild.id });
        if (!logSettings || !logSettings.memberJoinEnabled || !logSettings.memberJoinChannelId) return;

        const logChannel = member.guild.channels.cache.get(logSettings.memberJoinChannelId);
        if (!logChannel) return;

        // Intentar obtener los registros de auditoría
        let executorTag = messages[lang].unknown;
        try {
            const auditLogs = await member.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberAdd,
                limit: 1,
            });
            const createLog = auditLogs.entries.first();
            if (createLog) {
                executorTag = createLog.executor ? createLog.executor.tag : messages[lang].unknown;
            }
        } catch (error) {
            console.error('Error al obtener registros de auditoría:', error);
        }

        // Información del miembro
        const userTag = member.user.tag;
        const Time = time(new Date());
        const totalMembers = member.guild.memberCount;

        // Crear embed multilenguaje
        const embed = new EmbedBuilder()
            .setColor('#00FF00') // Verde, para indicar que el miembro se unió correctamente
            .setTitle(messages[lang].title)
            .setDescription(messages[lang].description.replace('{userTag}', userTag))
            .addFields(
                { name: messages[lang].userAdded, value: `\`\`\`${userTag}\`\`\`` },
                { name: messages[lang].invitedBy, value: `\`\`\`${executorTag}\`\`\`` },
                { name: messages[lang].joinedAt, value: `${Time}`, inline: true },
                { name: messages[lang].totalMembers, value: `${totalMembers}`, inline: true }
            )
            .setTimestamp();

        // Enviar embed al canal configurado
        await logChannel.send({ embeds: [embed] });
    },
};
