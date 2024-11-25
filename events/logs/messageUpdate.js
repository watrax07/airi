const { EmbedBuilder, time, channelMention } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup'); // Importar GuildSetup
const messages = require('./messages/messageUpdate'); // Importar mensajes

module.exports = {
    name: 'messageUpdate',
    async execute(client, oldMessage, newMessage) {
        // Validar si el mensaje pertenece a un servidor
        if (!newMessage.guild) return;

        // Ignorar mensajes de bots
        if (newMessage.author.bot) return;

        // Ignorar mensajes que no contengan contenido visible
        if (!oldMessage.content && !newMessage.content) return;

        // Ignorar mensajes con solo embeds, archivos o imágenes
        if (newMessage.attachments.size > 0 || newMessage.embeds.length > 0) return;

        // Obtener configuración del servidor
        const guildSetup = await GuildSetup.findOne({ guildId: newMessage.guild.id });
        if (!guildSetup || !guildSetup.isSetupComplete) return;

        const lang = guildSetup.language || 'en'; // Determinar idioma del servidor

        // Obtener configuración de logs
        const logSettings = await LogSettings.findOne({ guildId: newMessage.guild.id });
        if (!logSettings || !logSettings.messageUpdateEnabled || !logSettings.messageUpdateChannelId) return;

        const logChannel = newMessage.guild.channels.cache.get(logSettings.messageUpdateChannelId);
        if (!logChannel) return;

        const Time = time(new Date());
        const channelTag = channelMention(newMessage.channel.id);

        // Crear embed multilenguaje
        const embed = new EmbedBuilder()
            .setColor('#ff9900')
            .setTitle(messages[lang].title)
            .setDescription(
                messages[lang].description
                    .replace('{authorTag}', newMessage.author.tag || messages[lang].unknown)
                    .replace('{channelName}', newMessage.channel.name || messages[lang].unknown)
            )
            .addFields(
                { name: messages[lang].now, value: `\`\`\`${newMessage.content || messages[lang].unknownContent}\`\`\`` },
                { name: messages[lang].before, value: `\`\`\`${oldMessage.content || messages[lang].unknownContent}\`\`\`` },
                { name: messages[lang].author, value: newMessage.author.tag || messages[lang].unknown, inline: true },
                { name: messages[lang].channel, value: channelTag, inline: true },
                { name: messages[lang].editedAt, value: Time, inline: true }
            )
            .setTimestamp();

        // Enviar embed al canal configurado
        logChannel.send({ embeds: [embed] });
    },
};
