const GuildSetup = require('../../Schemas/guildSetup');
const { EmbedBuilder } = require('discord.js');
const messages = require('./messages/timeout'); // Asegúrate de importar el archivo de mensajes

module.exports = {
    name: 'timeout',
    description: 'Aplica un timeout a un miembro del servidor. Usa: !timeout @usuario [días] [minutos]',
    owner: false,
    category: 'Admin',
    async execute(message, args) {
        const guildId = message.guild.id;

        // Busca si el servidor ya completó la configuración
        const guild = await GuildSetup.findOne({ guildId: guildId });

        if (!guild || !guild.isSetupComplete) {
            const lang = guild ? guild.language : 'en';
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].setupRequired}**`);
            return message.channel.send({ embeds: [embed] });
        }

        const lang = guild.language;

        // Verificar si el usuario tiene permisos para aplicar timeout
        if (!message.member.permissions.has('ModerateMembers')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].noPermissions}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar si el bot tiene permisos para aplicar timeout
        if (!message.guild.members.me.permissions.has('ModerateMembers')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].botError}**`);
            return message.channel.send({ embeds: [embed] });
        }

        const userToTimeout = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);

        if (!userToTimeout || !userToTimeout.user) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].mentionUser}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar si el usuario es un bot
        if (userToTimeout.user.bot) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].cannotTimeoutBot}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar si el miembro tiene un rango más alto que el bot
        if (userToTimeout.roles.highest.position >= message.guild.members.me.roles.highest.position) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].higherRank}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar si el usuario a timeout tiene permisos más altos que el ejecutor
        if (userToTimeout.permissions.has('ModerateMembers')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].cannotTimeoutHigherPerms}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Variables para almacenar el tiempo total en milisegundos
        let totalMilliseconds = 0;

        // Procesar argumentos para días y minutos
        for (const arg of args.slice(1)) {
            const value = parseInt(arg.slice(0, -1)); // Obtener el número
            const unit = arg.slice(-1); // Obtener la unidad

            if (isNaN(value) || value <= 0) {
                const embed = new EmbedBuilder()
                    .setColor('#f3b0ff')
                    .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].invalidValue}**`);
                return message.channel.send({ embeds: [embed] });
            }

            if (unit === 'd') {
                totalMilliseconds += value * 24 * 60 * 60 * 1000; // Convertir días a milisegundos
            } else if (unit === 'm') {
                totalMilliseconds += value * 60 * 1000; // Convertir minutos a milisegundos
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#f3b0ff')
                    .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].invalidFormat}**`);
                return message.channel.send({ embeds: [embed] });
            }
        }

        if (totalMilliseconds <= 0) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].noDuration}**`);
            return message.channel.send({ embeds: [embed] });
        }

        try {
            const timeoutReason = messages[lang].timeoutReason
                .replace('{user}', message.author.tag)
                .replace('{duration}', totalMilliseconds / 1000 / 60);

            await userToTimeout.timeout(totalMilliseconds, timeoutReason);

            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<:timeout:1307470217013887017> ' + `**${messages[lang].timeoutSuccess.replace('{user}', userToTimeout.user.tag).replace('{duration}', totalMilliseconds / 1000 / 60)}**`);
            return message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].timeoutError}**`);
            return message.channel.send({ embeds: [embed] });
        }
    },
};
