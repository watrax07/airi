const { EmbedBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');

module.exports = {
    name: 'channelDelete',
    async execute(client, channel) {

        if (!channel.guild) return;

        const logSettings = await LogSettings.findOne({ guildId: channel.guild.id });
        if (!logSettings || !logSettings.channelDeleteEnabled || !logSettings.channelDeleteChannelId) return;

        const logChannel = channel.guild.channels.cache.get(logSettings.channelDeleteChannelId);
        if (!logChannel) return;

        // Validar datos del canal
        const channelName = channel.name || 'Sin nombre';
        const channelType = channel.type || 'Desconocido';
        const channelId = channel.id || 'ID no disponible';

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🗑️ Canal Eliminado')
            .setDescription(`Un canal fue eliminado.`)
            .addFields(
                { name: 'Nombre del Canal', value: channelName, inline: true },
                { name: 'Tipo', value: channelType, inline: true },
                { name: 'ID del Canal', value: channelId, inline: true }
            )
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    },
};
