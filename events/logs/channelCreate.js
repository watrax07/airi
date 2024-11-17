const { EmbedBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');

module.exports = {
    name: 'channelCreate',
    async execute(client, channel) {

        if (!channel.guild) return;

        const logSettings = await LogSettings.findOne({ guildId: channel.guild.id });
        if (!logSettings || !logSettings.channelCreateEnabled || !logSettings.channelCreateChannelId) return;

        const logChannel = channel.guild.channels.cache.get(logSettings.channelCreateChannelId);
        if (!logChannel) return;

        // Asegúrate de validar correctamente los valores del canal
        const channelType = channel.type || 'Desconocido';
        const channelName = channel.name || 'Sin nombre';
        const channelId = channel.id || 'ID no disponible';

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('📁 Canal Creado')
            .setDescription(`Un nuevo canal fue creado.`)
            .addFields(
                { name: 'Nombre', value: channelName, inline: true },
                { name: 'Tipo', value: channelType, inline: true },
                { name: 'ID del Canal', value: channelId, inline: true }
            )
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    },
};
