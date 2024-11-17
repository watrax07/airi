const GuildSetup = require('../../Schemas/guildSetup');
const Warning = require('../../Schemas/warning');
const WarnAction = require('../../Schemas/warnAction');
const LogSettings = require('../../Schemas/LogSchema');
const { EmbedBuilder } = require('discord.js');
const ms = require('ms'); // Librería para convertir tiempos
const messages = require('./messages/warn');

module.exports = {
    name: 'warn',
    description: 'Advierte a un miembro del servidor.',
    owner: false,
    category: 'Admin',
    async execute(message, args) {
        const guildId = message.guild.id;

        // Verificar si el servidor está configurado
        const guild = await GuildSetup.findOne({ guildId: guildId });
        if (!guild || !guild.isSetupComplete) {
            const lang = guild ? guild.language : 'es';
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].setupRequired}**`);
            return message.channel.send({ embeds: [embed] });
        }

        const lang = guild.language;

        // Verificar permisos del usuario
        if (!message.member.permissions.has('ModerateMembers')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].noPermissions}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar permisos del bot
        if (!message.guild.members.me.permissions.has('ModerateMembers')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].botError}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Buscar usuario por mención o ID
        const userToWarn = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
        if (!userToWarn) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].mentionUser}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar si el usuario es un bot
        if (userToWarn.user.bot) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].cannotWarnBot}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar si el usuario tiene un rango más alto que el bot
        if (userToWarn.roles.highest.position >= message.guild.members.me.roles.highest.position) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].higherRank}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar si el usuario tiene permisos más altos que el ejecutor
        if (userToWarn.permissions.has('ModerateMembers')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].cannotWarnHigherPerms}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Obtener la razón de la advertencia
        const reason = args.slice(1).join(' ') || messages[lang].noReason;

        try {
            // Guardar advertencia en la base de datos
            const warning = new Warning({
                GuildId: guildId,
                UserId: userToWarn.id,
                Reason: reason,
                Date: new Date(),
            });
            await warning.save();

            // Enviar mensaje al canal
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setTitle('<:hi:1307446284226924605>' + messages[lang].warnTitle)
                .setDescription(
                    `${messages[lang].warnSuccess.replace('{user}', userToWarn.user.tag)}\n\`\`\`${reason.trim()}\`\`\``)
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
            const logSettings = await LogSettings.findOne({ guildId: guildId });
            if (logSettings?.userWarnEnabled && logSettings.userWarnChannelId) {
                const logChannel = message.guild.channels.cache.get(logSettings.userWarnChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#ff9900')
                        .setTitle('⚠️ Advertencia Emitida')
                        .setDescription(`El usuario **${userToWarn.user.tag}** ha sido advertido.`)
                        .addFields(
                            { name: 'Razón', value: reason, inline: true },
                            { name: 'Moderador', value: message.author.tag, inline: true },
                            { name: 'ID del Usuario', value: userToWarn.id, inline: true }
                        )
                        .setTimestamp();

                    logChannel.send({ embeds: [logEmbed] });
                }
            }

            // Enviar mensaje directo al usuario advertido
            const dmEmbed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setTitle('<:hi:1307446284226924605>' +  messages[lang].dmTitle)
                .setDescription(
                    `${messages[lang].dmDescription.replace('{server}', message.guild.name)}\n\n**${messages[lang].reason}:**\n\`\`\`${reason.trim()}\`\`\``)
                .setTimestamp();

            await userToWarn.send({ embeds: [dmEmbed] }).catch(() => {
                console.log(`No se pudo enviar el mensaje directo a ${userToWarn.user.tag}.`);
            });

            // Llamar a la función que verifica y ejecuta la acción de advertencias
            await handleWarnAction(userToWarn.id, guildId, message.guild, message);

        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].warnError}**`);
            return message.channel.send({ embeds: [embed] });
        }
    },
};

async function handleWarnAction(userId, guildId, guild, message) {
    const userWarnings = await Warning.countDocuments({ UserId: userId, GuildId: guildId });
    const warnAction = await WarnAction.findOne({ GuildId: guildId });

    if (!warnAction) return;

    for (const action of warnAction.Actions) {
        for (const threshold of action.Thresholds) {
            if (userWarnings >= threshold.Warns) {
                try {
                    const user = await guild.members.fetch(userId);

                    if (action.Action === 'kick') {
                        await user.kick('Número de advertencias alcanzado');
                        message.channel.send({ embeds: [kickEmbed] });
                    } else if (action.Action === 'ban') {
                        await user.ban({ reason: 'Número de advertencias alcanzado' });
                        const banEmbed = new EmbedBuilder()
                        message.channel.send({ embeds: [banEmbed] });
                    } else if (action.Action === 'timeout') {
                        await user.timeout(threshold.Timeout, 'Número de advertencias alcanzado');
                        
                    }
                } catch (error) {
                    console.error(`Error al ejecutar la acción "${action.Action}":`, error);
                }
            }
        }
    }
}

