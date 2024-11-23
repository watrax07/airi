const { EmbedBuilder, time, channelMention} = require('discord.js');
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
        const oldPermissions = oldChannel.permissionOverwrites.cache;
        const newPermissions = newChannel.permissionOverwrites.cache;

        newPermissions.forEach(newPerm => {
            const oldPerm = oldPermissions.get(newPerm.id);

            if (oldPerm) {
                // Comparar permisos agregados
                const addedPermissions = newPerm.allow.toArray().filter(p => !oldPerm.allow.has(p));
                const removedPermissions = oldPerm.allow.toArray().filter(p => !newPerm.allow.has(p));

                const addedDeny = newPerm.deny.toArray().filter(p => !oldPerm.deny.has(p));
                const removedDeny = oldPerm.deny.toArray().filter(p => !newPerm.deny.has(p));

                if (addedPermissions.length > 0) {
                    permissionChanges += `✅ **Permisos Permitidos Agregados** para <@&${newPerm.id}>:\n\`${addedPermissions.join(', ')}\`\n`;
                }
                if (removedPermissions.length > 0) {
                    permissionChanges += `❌ **Permisos Permitidos Eliminados** para <@&${newPerm.id}>:\n\`${removedPermissions.join(', ')}\`\n`;
                }

                if (addedDeny.length > 0) {
                    permissionChanges += `🚫 **Permisos Denegados Agregados** para <@&${newPerm.id}>:\n\`${addedDeny.join(', ')}\`\n`;
                }
                if (removedDeny.length > 0) {
                    permissionChanges += `♻️ **Permisos Denegados Eliminados** para <@&${newPerm.id}>:\n\`${removedDeny.join(', ')}\`\n`;
                }
            } else {
                // Si no existía antes, es un nuevo permiso
                permissionChanges += `🆕 **Permisos Añadidos** para <@&${newPerm.id}>:\n\`Permitidos: ${newPerm.allow.toArray().join(', ')}\`\n\`Denegados: ${newPerm.deny.toArray().join(', ')}\`\n`;
            }
        });

        // Verificar permisos eliminados completamente
        oldPermissions.forEach(oldPerm => {
            if (!newPermissions.has(oldPerm.id)) {
                permissionChanges += `🗑️ **Permisos Eliminados** para <@&${oldPerm.id}>:\n\`Permitidos: ${oldPerm.allow.toArray().join(', ')}\`\n\`Denegados: ${oldPerm.deny.toArray().join(', ')}\`\n`;
            }
        });

        if (!permissionChanges) {
            permissionChanges = 'No se detectaron cambios en los permisos.';
        }

         const channelId = newChannel.id
         const date = new Date()
         const Time = time(date)
         const channelTag = channelMention(channelId)

        const embed = new EmbedBuilder()
            .setColor('#ffa500')
            .setTitle('✏️ Canal Editado')
            .setDescription(`Un canal fue editado.`)
            .addFields(
                { name: 'Antes', value: `\`\`\`${oldChannelName}\`\`\`` || `\`\`\`Contenido no visible\`\`\`` },
                { name: 'Después', value: `\`\`\`${newChannelName}\`\`\`` || `\`\`\`Contenido no visible\`\`\`` },
                { name: 'ID del Canal,', value: channelTag, inline: true },
                { name: `Fecha y hora modificado.`, value: Time, inline: true }
                
            )
            .addFields({ name: 'Cambios en los Permisos', value: permissionChanges })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    },
};

// mia