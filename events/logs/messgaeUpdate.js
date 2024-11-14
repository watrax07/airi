const { EmbedBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
module.exports = {
    name: 'messageUpdate',
    async execute(client, oldMessage, newMessage) {
        console.log('Evento messageUpdate activado');

        if (!newMessage.guild) {
            return;
        }

        const logSettings = await LogSettings.findOne({ guildId: newMessage.guild.id });
        if (!logSettings) {
            return;
        }

        if (logSettings.messageUpdateEnabled && logSettings.messageUpdateChannelId) {
            const logChannel = newMessage.guild.channels.cache.get(logSettings.messageUpdateChannelId);
            if (!logChannel) {
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('✏️ Mensaje Editado')
                .setDescription(`Un mensaje de **${newMessage.author.tag}** fue editado en **${newMessage.channel.name}**.`)
                .addFields(
                    { name: 'Antes', value: oldMessage.content || 'Contenido no visible' },
                    { name: 'Ahora', value: newMessage.content || 'Contenido no visible' },
                    { name: 'Autor', value: `${newMessage.author.tag}`, inline: true },
                    { name: 'Canal', value: `${newMessage.channel.name}`, inline: true }
                )
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }
    },
};
