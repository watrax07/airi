const { EmbedBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
module.exports = {
    name: 'roleUpdate',
    async execute(client, oldRole, newRole) {
        console.log('Evento roleUpdate activado');

        if (!newRole.guild) {
            return;
        }

        const logSettings = await LogSettings.findOne({ guildId: newRole.guild.id });
        if (!logSettings) {
            return;
        }

        if (logSettings.roleUpdateEnabled && logSettings.roleUpdateChannelId) {
            const logChannel = newRole.guild.channels.cache.get(logSettings.roleUpdateChannelId);
            if (!logChannel) {
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('✏️ Rol Actualizado')
                .setDescription(`El rol **${oldRole.name}** fue actualizado.`)
                .addFields(
                    { name: 'Rol Anterior', value: oldRole.name, inline: true },
                    { name: 'Rol Nuevo', value: newRole.name, inline: true },
                    { name: 'ID del Rol', value: newRole.id, inline: true }
                )
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }
    },
};
