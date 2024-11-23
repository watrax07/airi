const { EmbedBuilder, time, channelMention } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');

module.exports = {
    name: 'messageUpdate',
    async execute(client, oldMessage, newMessage) {

        // Validar si el mensaje pertenece a un servidor
        if (!newMessage.guild) {
            return;
        }

        // Ignorar mensajes de bots
        if (newMessage.author.bot) {
            return;
        }

        // Ignorar mensajes que no contengan contenido visible
        if (!oldMessage.content && !newMessage.content) {
            return;
        }

        // Ignorar mensajes con solo embeds, archivos o imágenes
        if (newMessage.attachments.size > 0 || newMessage.embeds.length > 0) {
            return;
        }

        const logSettings = await LogSettings.findOne({ guildId: newMessage.guild.id });
        if (!logSettings) {
            return;
        }

        

        // Validar si el logging está habilitado y el canal está configurado
        if (logSettings.messageUpdateEnabled && logSettings.messageUpdateChannelId) {
            const logChannel = newMessage.guild.channels.cache.get(logSettings.messageUpdateChannelId);
            if (!logChannel) {
                return;
            }


        const date = new Date();
        const Time = time(date)
        const channeltag = channelMention(newMessage.channel.id)


            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('✏️ Mensaje Editado')
                .setDescription(`Un mensaje de **${newMessage.author.tag}** fue editado en **${newMessage.channel.name}**.`)
                .addFields(
                    { name: 'Ahora', value: `\`\`\`${newMessage.content}\`\`\`` || `\`\`\`Contenido no visible\`\`\`` },
                    { name: 'Antes', value: `\`\`\`${oldMessage.content}\`\`\`` || `\`\`\`Contenido no visible\`\`\`` },
                    { name: 'Autor', value: `${newMessage.author.tag}`, inline: true },
                    { name: 'Canal', value: channeltag, inline: true },
                    { name: `Editado a las`, value: Time, inline: true}
                )
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }
    },
};

// mia
