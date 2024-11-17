const { EmbedBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
module.exports = {
    name: 'roleDelete',
    async execute(client, role) {

        if (!role.guild) {
            return;
        }

        const logSettings = await LogSettings.findOne({ guildId: role.guild.id });
        if (!logSettings) {
            return;
        }

        if (logSettings.roleDeleteEnabled && logSettings.roleDeleteChannelId) {
            const logChannel = role.guild.channels.cache.get(logSettings.roleDeleteChannelId);
            if (!logChannel) {
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🛑 Rol Eliminado')
                .setDescription(`El rol **${role.name}** fue eliminado del servidor.`)
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
