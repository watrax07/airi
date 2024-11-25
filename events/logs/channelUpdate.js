const { EmbedBuilder, time, channelMention } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup'); // Importar GuildSetup
const messages = require('./messages/channelUpdate'); // Importar mensajes

module.exports = {
    name: 'channelUpdate',
    async execute(client, oldChannel, newChannel) {
        if (!newChannel.guild) return;

        // Obtener configuración del servidor
        const guildSetup = await GuildSetup.findOne({ guildId: newChannel.guild.id });
        if (!guildSetup || !guildSetup.isSetupComplete) return;

        const lang = guildSetup.language || 'en'; // Determinar idioma

        // Obtener configuración de logs
        const logSettings = await LogSettings.findOne({ guildId: newChannel.guild.id });
        if (!logSettings || !logSettings.channelEditEnabled || !logSettings.channelEditChannelId) return;

        const logChannel = newChannel.guild.channels.cache.get(logSettings.channelEditChannelId);
        if (!logChannel) return;

        // Validar valores antes y después del canal
        const oldChannelName = oldChannel.name || messages[lang].unknown;
        const newChannelName = newChannel.name || messages[lang].unknown;

        // Verificar cambios en los permisos
        let permissionChanges = '';
        const oldPermissions = oldChannel.permissionOverwrites.cache;
        const newPermissions = newChannel.permissionOverwrites.cache;

        newPermissions.forEach(newPerm => {
            const oldPerm = oldPermissions.get(newPerm.id);

            if (oldPerm) {
                // Comparar permisos
                const addedPermissions = newPerm.allow.toArray().filter(p => !oldPerm.allow.has(p));
                const removedPermissions = oldPerm.allow.toArray().filter(p => !newPerm.allow.has(p));

                const addedDenied = newPerm.deny.toArray().filter(p => !oldPerm.deny.has(p));
                const removedDenied = oldPerm.deny.toArray().filter(p => !newPerm.deny.has(p));

                if (addedPermissions.length > 0) {
                    permissionChanges += messages[lang].addedAllowed.replace('{role}', `<@&${newPerm.id}>`) + `\n\`${addedPermissions.join(', ')}\`\n`;
                }
                if (removedPermissions.length > 0) {
                    permissionChanges += messages[lang].removedAllowed.replace('{role}', `<@&${newPerm.id}>`) + `\n\`${removedPermissions.join(', ')}\`\n`;
                }

                if (addedDenied.length > 0) {
                    permissionChanges += messages[lang].addedDenied.replace('{role}', `<@&${newPerm.id}>`) + `\n\`${addedDenied.join(', ')}\`\n`;
                }
                if (removedDenied.length > 0) {
                    permissionChanges += messages[lang].removedDenied.replace('{role}', `<@&${newPerm.id}>`) + `\n\`${removedDenied.join(', ')}\`\n`;
                }
            } else {
                // Nuevos permisos
                permissionChanges += messages[lang].newPermissions.replace('{role}', `<@&${newPerm.id}>`) + `\n${messages[lang].allowed}: \`${newPerm.allow.toArray().join(', ')}\`\n${messages[lang].denied}: \`${newPerm.deny.toArray().join(', ')}\`\n`;
            }
        });

        // Permisos eliminados completamente
        oldPermissions.forEach(oldPerm => {
            if (!newPermissions.has(oldPerm.id)) {
                permissionChanges += messages[lang].removedPermissions.replace('{role}', `<@&${oldPerm.id}>`) + `\n${messages[lang].allowed}: \`${oldPerm.allow.toArray().join(', ')}\`\n${messages[lang].denied}: \`${oldPerm.deny.toArray().join(', ')}\`\n`;
            }
        });

        if (!permissionChanges) {
            permissionChanges = messages[lang].noPermissionChanges;
        }

        const channelId = newChannel.id;
        const Time = time(new Date());
        const channelTag = channelMention(channelId);

        const embed = new EmbedBuilder()
            .setColor('#ffa500')
            .setTitle(messages[lang].title)
            .setDescription(messages[lang].description)
            .addFields(
                { name: messages[lang].before, value: `\`\`\`${oldChannelName}\`\`\`` },
                { name: messages[lang].after, value: `\`\`\`${newChannelName}\`\`\`` },
                { name: messages[lang].channelId, value: channelTag, inline: true },
                { name: messages[lang].modifiedAt, value: Time, inline: true }
            )
            .addFields({ name: messages[lang].permissionChanges, value: permissionChanges })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    },
};
