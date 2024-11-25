const { EmbedBuilder, roleMention, time } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup'); // Importar GuildSetup
const messages = require('./messages/roleUpdate'); // Importar mensajes

module.exports = {
    name: 'roleUpdate',
    async execute(client, oldRole, newRole) {
        if (!newRole.guild) return;

        // Obtener configuración del servidor
        const guildSetup = await GuildSetup.findOne({ guildId: newRole.guild.id });
        if (!guildSetup || !guildSetup.isSetupComplete) return;

        const lang = guildSetup.language || 'en'; // Determinar idioma del servidor

        // Obtener configuración de logs
        const logSettings = await LogSettings.findOne({ guildId: newRole.guild.id });
        if (!logSettings || !logSettings.roleUpdateEnabled || !logSettings.roleUpdateChannelId) return;

        const logChannel = newRole.guild.channels.cache.get(logSettings.roleUpdateChannelId);
        if (!logChannel) return;

        // Verificar cambios en permisos
        let permissionChanges = '';
        const oldPermissions = oldRole.permissions.toArray();
        const newPermissions = newRole.permissions.toArray();

        const addedPermissions = newPermissions.filter(p => !oldPermissions.includes(p));
        const removedPermissions = oldPermissions.filter(p => !newPermissions.includes(p));

        if (addedPermissions.length > 0) {
            permissionChanges += `${messages[lang].addedPermissions}\n\`${addedPermissions.join(', ')}\`\n`;
        }

        if (removedPermissions.length > 0) {
            permissionChanges += `${messages[lang].removedPermissions}\n\`${removedPermissions.join(', ')}\`\n`;
        }

        if (!permissionChanges) {
            permissionChanges = messages[lang].noPermissionChanges;
        }

        const roleID = oldRole.id;
        const roleTag = roleMention(roleID);
        const Time = time(new Date());

        // Crear embed multilenguaje
        const embed = new EmbedBuilder()
            .setColor('#ffaa00')
            .setTitle(messages[lang].title)
            .setDescription(
                messages[lang].description.replace('{oldRoleName}', oldRole.name || messages[lang].unknown)
            )
            .addFields(
                { name: messages[lang].oldName, value: `\`\`\`${oldRole.name || messages[lang].unknown}\`\`\`` },
                { name: messages[lang].newName, value: `\`\`\`${newRole.name || messages[lang].unknown}\`\`\`` },
                { name: messages[lang].roleId, value: `\`\`\`${roleID}\`\`\``, inline: true },
                { name: messages[lang].roleTag, value: roleTag || messages[lang].unknown, inline: true },
                { name: messages[lang].time, value: Time, inline: true }
            )
            .addFields({ name: messages[lang].permissionChanges, value: permissionChanges })
            .setTimestamp();

        // Enviar embed al canal configurado
        logChannel.send({ embeds: [embed] });
    },
};
