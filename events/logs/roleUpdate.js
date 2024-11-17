const { EmbedBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');

module.exports = {
    name: 'roleUpdate',
    async execute(client, oldRole, newRole) {

        if (!newRole.guild) return;

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
            permissionChanges += `✅ **Permisos Agregados**:\n\`${addedPermissions.join(', ')}\`\n`;
        }

        if (removedPermissions.length > 0) {
            permissionChanges += `❌ **Permisos Eliminados**:\n\`${removedPermissions.join(', ')}\`\n`;
        }

        if (!permissionChanges) {
            permissionChanges = 'No se detectaron cambios en los permisos.';
        }

        // Crear embed
        const embed = new EmbedBuilder()
            .setColor('#ffaa00')
            .setTitle('✏️ Rol Actualizado')
            .setDescription(`El rol **${oldRole.name}** fue actualizado.`)
            .addFields(
                { name: 'Rol Anterior', value: oldRole.name || 'Sin nombre', inline: true },
                { name: 'Rol Nuevo', value: newRole.name || 'Sin nombre', inline: true },
                { name: 'ID del Rol', value: newRole.id || 'ID no disponible', inline: true }
            )
            .addFields({ name: 'Cambios en los Permisos', value: permissionChanges })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    },
};
