const { EmbedBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');

module.exports = {
    name: 'guildBanRemove',
    async execute(client, ban) {

        const logSettings = await LogSettings.findOne({ guildId: ban.guild.id });
        if (!logSettings || !logSettings.userUnwarnEnabled || !logSettings.userUnwarnChannelId) return;

        const logChannel = ban.guild.channels.cache.get(logSettings.userUnwarnChannelId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('❌ Usuario Desbaneado')
            .setDescription(`El usuario **${ban.user.tag}** fue desbaneado.`)
            .addFields({ name: 'ID del Usuario', value: ban.user.id })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    },
};
