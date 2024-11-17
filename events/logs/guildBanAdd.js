const { EmbedBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');

module.exports = {
    name: 'guildBanAdd',
    async execute(client, ban) {
        const logSettings = await LogSettings.findOne({ guildId: ban.guild.id });
        if (!logSettings || !logSettings.userBanEnabled || !logSettings.userBanChannelId) return;

        const logChannel = ban.guild.channels.cache.get(logSettings.userBanChannelId);
        if (!logChannel) return;

        // Obtener razón del ban (si está disponible)
        const auditLogs = await ban.guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD', limit: 1 });
        const banLog = auditLogs.entries.find(entry => entry.target.id === ban.user.id);

        const reason = banLog?.reason || 'No especificada';

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🔨 Usuario Baneado')
            .setDescription(`El usuario **${ban.user.tag}** fue baneado.`)
            .addFields(
                { name: 'ID del Usuario', value: ban.user.id },
                { name: 'Razón', value: reason }
            )
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    },
};
