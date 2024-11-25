const { EmbedBuilder, time } = require('discord.js'); // Usar `time` para marcas de tiempo
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup'); // Importar GuildSetup
const messages = require('./messages/messageDelete'); // Importar mensajes

module.exports = {
    name: 'messageDelete',
    async execute(client, message) {
        if (!message.guild) return;

        // Obtener configuración del servidor
        const guildSetup = await GuildSetup.findOne({ guildId: message.guild.id });
        if (!guildSetup || !guildSetup.isSetupComplete) return;

        const lang = guildSetup.language || 'en'; // Determinar idioma del servidor

        // Obtener configuración de logs
        const logSettings = await LogSettings.findOne({ guildId: message.guild.id });
        if (!logSettings || !logSettings.messageDeleteEnabled || !logSettings.messageDeleteChannelId) return;

        const logChannel = message.guild.channels.cache.get(logSettings.messageDeleteChannelId);
        if (!logChannel) return;

        // Validar valores del autor y contenido del mensaje
        const authorTag = message.author?.tag || messages[lang].unknown;
        const content = message.content && message.content.length > 0
            ? `"${message.content}"`
            : messages[lang].noContent;
        const timestamp = time(new Date()); // Marcar hora y fecha

        // Validar canal
        const channelName = message.channel?.name || messages[lang].unknown;

        // Crear embed multilenguaje
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle(messages[lang].title)
            .setDescription(
                messages[lang].description
                    .replace('{authorTag}', authorTag)
                    .replace('{channelName}', channelName)
            )
            .addFields(
                { name: messages[lang].content, value: `\`\`\`${content}\`\`\`` },
                { name: messages[lang].author, value: `\`\`\`${authorTag}\`\`\`` },
                { name: messages[lang].deletedAt, value: timestamp, inline: true },
                { name: messages[lang].deletedIn, value: channelName, inline: true }
            )
            .setTimestamp();

        // Enviar el log
        logChannel.send({ embeds: [embed] });
    },
};
