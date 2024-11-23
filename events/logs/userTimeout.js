const { EmbedBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(client, oldMember, newMember) {
        const logSettings = await LogSettings.findOne({ guildId: newMember.guild.id });
        if (!logSettings || !logSettings.userTimeoutEnabled || !logSettings.userTimeoutChannelId) return;

        const logChannel = newMember.guild.channels.cache.get(logSettings.userTimeoutChannelId);
        if (!logChannel) return;

        // Detectar si el usuario fue puesto en timeout
        const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
        const newTimeout = newMember.communicationDisabledUntilTimestamp;

        if (oldTimeout !== newTimeout) {
            const duration = newTimeout
                ? `<t:${Math.floor(newTimeout / 1000)}:R>` // Formato de tiempo relativo
                : 'Timeout finalizado';

            const embed = new EmbedBuilder()
                .setColor(newTimeout ? '#ff9900' : '#00ff00')
                .setTitle(newTimeout ? '⏳ ${newMember.user.tag} acaba de ser Timeout' : '✅ Timeout Finalizado')
                .setDescription(`El usuario **${newMember.user.tag}** ${newTimeout ? 'fue puesto en timeout' : 'ha salido del timeout'}.`)
                .addFields({ name: 'Duración', value: newTimeout ? duration : 'N/A', inline: true })
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }
    },
};
