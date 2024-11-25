const { EmbedBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup'); // Importar GuildSetup
const messages = require('./messages/guildMemberUpdate'); // Importar mensajes

module.exports = {
    name: 'guildMemberUpdate',
    async execute(client, oldMember, newMember) {
        // Obtener configuración del servidor
        const guildSetup = await GuildSetup.findOne({ guildId: newMember.guild.id });
        if (!guildSetup || !guildSetup.isSetupComplete) return;

        const lang = guildSetup.language || 'en'; // Determinar idioma del servidor

        // Obtener configuración de logs
        const logSettings = await LogSettings.findOne({ guildId: newMember.guild.id });
        if (!logSettings || !logSettings.userTimeoutEnabled || !logSettings.userTimeoutChannelId) return;

        const logChannel = newMember.guild.channels.cache.get(logSettings.userTimeoutChannelId);
        if (!logChannel) return;

        // Detectar cambios en el estado de timeout
        const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
        const newTimeout = newMember.communicationDisabledUntilTimestamp;

        if (oldTimeout !== newTimeout) {
            const duration = newTimeout
                ? `<t:${Math.floor(newTimeout / 1000)}:R>` // Formato de tiempo relativo
                : messages[lang].timeoutEnded;

            // Crear embed multilenguaje
            const embed = new EmbedBuilder()
                .setColor(newTimeout ? '#ff9900' : '#00ff00')
                .setTitle(
                    newTimeout
                        ? messages[lang].timeoutSetTitle
                        : messages[lang].timeoutRemoveTitle
                )
                .setDescription(
                    newTimeout
                        ? messages[lang].descriptionSet.replace('{userTag}', newMember.user.tag)
                        : messages[lang].descriptionRemove.replace('{userTag}', newMember.user.tag)
                )
                .addFields({ name: messages[lang].duration, value: newTimeout ? duration : 'N/A', inline: true })
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }
    },
};
