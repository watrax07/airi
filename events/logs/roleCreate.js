const { EmbedBuilder, time, AuditLogEvent, roleMention } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup'); // Importar GuildSetup
const messages = require('./messages/roleCreate'); // Importar mensajes

module.exports = {
    name: 'roleCreate',
    async execute(client, role) {
        if (!role.guild) return;

        // Obtener configuración del servidor
        const guildSetup = await GuildSetup.findOne({ guildId: role.guild.id });
        if (!guildSetup || !guildSetup.isSetupComplete) return;

        const lang = guildSetup.language || 'en'; // Determinar idioma del servidor

        // Obtener configuración de logs
        const logSettings = await LogSettings.findOne({ guildId: role.guild.id });
        if (!logSettings || !logSettings.roleCreateEnabled || !logSettings.roleCreateChannelId) return;

        const logChannel = role.guild.channels.cache.get(logSettings.roleCreateChannelId);
        if (!logChannel) return;

        // Obtener registros de auditoría
        let executorTag = messages[lang].unknown;
        try {
            const auditLogs = await role.guild.fetchAuditLogs({
                type: AuditLogEvent.RoleCreate,
                limit: 1,
            });
            const createLog = auditLogs.entries.first();
            if (createLog) {
                executorTag = createLog.executor?.tag || messages[lang].unknown;
            }
        } catch (error) {
            console.error('Error al obtener registros de auditoría:', error);
        }

        // Datos del rol
        const roleName = role.name || messages[lang].unknown;
        const roleId = role.id || messages[lang].unknown;
        const roleColor = `#${role.color.toString(16).padStart(6, '0')}`;
        const roleTag = roleMention(roleId);
        const Time = time(new Date());

        // Crear embed multilenguaje
        const embed = new EmbedBuilder()
            .setColor(role.color)
            .setTitle(messages[lang].title)
            .setDescription(messages[lang].description.replace('{roleName}', roleName))
            .addFields(
                { name: messages[lang].roleName, value: `\`\`\`${roleName}\`\`\`` },
                { name: messages[lang].roleId, value: `\`\`\`${roleId}\`\`\`` },
                { name: messages[lang].createdBy, value: executorTag, inline: true },
                { name: messages[lang].roleColor, value: roleColor, inline: true },
                { name: messages[lang].roleMention, value: roleTag, inline: true },
                { name: messages[lang].createdAt, value: Time, inline: true }
            )
            .setTimestamp();

        // Enviar embed al canal configurado
        logChannel.send({ embeds: [embed] });
    },
};
