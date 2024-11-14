const { EmbedBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
module.exports = {
    name: 'roleCreate',
    async execute(client, role) {
        console.log('Evento roleCreate activado');

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

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎉 Nuevo Rol Creado')
                .setDescription(`Un nuevo rol llamado **${role.name}** fue creado en el servidor.`)
                .addFields(
                    { name: 'ID del Rol', value: role.id, inline: true },
                    { name: 'Color', value: role.color.toString(16), inline: true },
                    { name: 'Mencionar Rol', value: role.toString(), inline: true }
                )
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }
    },
};
