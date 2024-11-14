const { EmbedBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
module.exports = {
    name: 'messageDelete',
    async execute(client, message) {
        console.log('Evento messageDelete activado');
        
        if (!message.guild) {
            return;
        }

        const logSettings = await LogSettings.findOne({ guildId: message.guild.id });
        if (!logSettings) {
            return;
        }

        if (logSettings.messageDeleteEnabled && logSettings.messageDeleteChannelId) {
            const logChannel = message.guild.channels.cache.get(logSettings.messageDeleteChannelId);
            if (!logChannel) {
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚫 Mensaje Eliminado')
                .setDescription(`Un mensaje de **${message.author.tag}** fue eliminado en **${message.channel.name}**.`)
                .addFields(
                    { name: 'Contenido', value: message.content.length > 0 ? `"${message.content}"` : 'Mensaje sin contenido visible' },
                    { name: 'Autor', value: `${message.author.tag}`, inline: true },
                    { name: 'Canal', value: `${message.channel.name}`, inline: true }
                )
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }
    },
};
