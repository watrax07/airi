const { EmbedBuilder, time, AuditLogEvent } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup'); // Importar GuildSetup
const messages = require('./messages/roleDelete'); // Importar mensajes

module.exports = {
    name: 'roleDelete',
    async execute(client, role) {
        if (!role.guild) return;

        // Obtener configuración del servidor
        const guildSetup = await GuildSetup.findOne({ guildId: role.guild.id });
        if (!guildSetup || !guildSetup.isSetupComplete) return;

        const lang = guildSetup.language || 'en'; // Determinar idioma del servidor

        // Obtener configuración de logs
        const logSettings = await LogSettings.findOne({ guildId: role.guild.id });
        if (!logSettings || !logSettings.roleDeleteEnabled || !logSettings.roleDeleteChannelId) return;

        const logChannel = role.guild.channels.cache.get(logSettings.roleDeleteChannelId);
        if (!logChannel) return;

        // Obtener registros de auditoría
        let executorTag = messages[lang].unknown;
        try {
            const auditLogs = await role.guild.fetchAuditLogs({
                type: AuditLogEvent.RoleDelete,
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
        const Time = time(new Date());

        // Crear embed multilenguaje
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle(messages[lang].title)
            .setDescription(messages[lang].description.replace('{roleName}', roleName))
            .addFields(
                { name: messages[lang].roleName, value: `\`\`\`${roleName}\`\`\`` },
                { name: messages[lang].roleId, value: `\`\`\`${roleId}\`\`\`` },
                { name: messages[lang].roleColor, value: roleColor, inline: true },
                { name: messages[lang].deletedAt, value: Time, inline: true },
                { name: messages[lang].deletedBy, value: executorTag, inline: true }
            )
            .setTimestamp();

        // Enviar embed al canal configurado
        logChannel.send({ embeds: [embed] });
    },
};
