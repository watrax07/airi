const { EmbedBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');

module.exports = {
    name: 'channelUpdate',
    async execute(client, oldChannel, newChannel) {
        if (!newChannel.guild) return;

        const logSettings = await LogSettings.findOne({ guildId: newChannel.guild.id });
        if (!logSettings || !logSettings.channelEditEnabled || !logSettings.channelEditChannelId) return;

        const logChannel = newChannel.guild.channels.cache.get(logSettings.channelEditChannelId);
        if (!logChannel) return;

        // Validar valores antes y después del canal
        const oldChannelName = oldChannel.name || 'Sin nombre';
        const newChannelName = newChannel.name || 'Sin nombre';

        // Verificar cambios en los permisos
        let permissionChanges = '';
        const oldPermissions = oldChannel.permissionOverwrites.cache.map(overwrite => ({
            id: overwrite.id,
            allow: overwrite.allow.toArray(),
            deny: overwrite.deny.toArray()
        }));

        const newPermissions = newChannel.permissionOverwrites.cache.map(overwrite => ({
            id: overwrite.id,
            allow: overwrite.allow.toArray(),
            deny: overwrite.deny.toArray()
        }));

        newPermissions.forEach(newPerm => {
            const oldPerm = oldPermissions.find(p => p.id === newPerm.id);
            if (oldPerm) {
                const addedPermissions = newPerm.allow.filter(p => !oldPerm.allow.includes(p));
                const removedPermissions = oldPerm.allow.filter(p => !newPerm.allow.includes(p));

                if (addedPermissions.length > 0) {
                    permissionChanges += `✅ **Permisos Agregados** para <@&${newPerm.id}>:\n\`${addedPermissions.join(', ')}\`\n`;
                }
                if (removedPermissions.length > 0) {
                    permissionChanges += `❌ **Permisos Eliminados** para <@&${newPerm.id}>:\n\`${removedPermissions.join(', ')}\`\n`;
                }
            }
        });

        if (!permissionChanges) {
            permissionChanges = 'No se detectaron cambios en los permisos.';
        }

        const embed = new EmbedBuilder()
            .setColor('#ffa500')
            .setTitle('✏️ Canal Editado')
            .setDescription(`Un canal fue editado.`)
            .addFields(
                { name: 'Antes', value: oldChannelName, inline: true },
                { name: 'Después', value: newChannelName, inline: true },
                { name: 'ID del Canal', value: newChannel.id || 'ID no disponible', inline: true }
            )
            .addFields({ name: 'Cambios en los Permisos', value: permissionChanges })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    },
};
