// events/guild/guildMemberAdd.js
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const logSettings = await LogSettings.findOne({ guildId: member.guild.id });
        if (logSettings && logSettings.memberJoinChannelId) {
            const logChannel = member.guild.channels.cache.get(logSettings.memberJoinChannelId);
            if (logChannel) {
                logChannel.send(`🟢 ${member.user.tag} se ha unido al servidor.`);
            }
        }
    },
};
