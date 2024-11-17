const GuildSetup = require('../../Schemas/guildSetup');
const { EmbedBuilder } = require('discord.js');
const messages = require('./messages/kick'); // Asegúrate de tener un archivo de mensajes similar para kick

module.exports = {
    name: 'kick',
    description: 'Expulsa a un usuario del servidor.',
    owner: false,
    category: 'Admin',
    async execute(message, args) {
        const guildId = message.guild.id;
        const guild = await GuildSetup.findOne({ guildId: guildId });

        if (!guild || !guild.isSetupComplete) {
            const lang = guild ? guild.language : 'en';
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].setupRequired}**`);
            return message.channel.send({ embeds: [embed] });
        }

        const lang = guild.language;

        // Verificar si el usuario tiene permisos para expulsar
        if (!message.member.permissions.has('KickMembers')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].noPermissions}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar si el bot tiene permisos para expulsar
        if (!message.guild.members.me.permissions.has('KickMembers')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].boterror}**`);
            return message.channel.send({ embeds: [embed] });
        }

        const userToKick = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);
        if (!userToKick) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].mentionUser}**`);
            return message.channel.send({ embeds: [embed] });
        }

        const member = message.guild.members.cache.get(userToKick.id) || await message.guild.members.fetch(userToKick.id).catch(() => null);

        if (!member) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].memberNotFound}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar si el miembro es un bot
        if (member.user.bot) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].cannotKickBot}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar si el miembro tiene un rango más alto que el bot
        if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].higherRank}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar si el usuario a expulsar tiene permisos más altos que el ejecutor
        if (member.permissions.has('KickMembers')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].cannotKickHigherPerms}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Obtener la razón de la expulsión
        const reason = args.slice(1).join(' ') || messages[lang].kickReason;

        try {
            // Enviar mensaje directo al usuario expulsado
            const dmEmbed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setTitle('<a:ban:1307446358441070602> ' + messages[lang].dmTitle)
                .setDescription(messages[lang].dmDescription.replace('{server}', message.guild.name))
                .addFields({ name: messages[lang].reasonTitle, value: `\`\`\`${reason}\`\`\`` })
                .setTimestamp();

            await userToKick.send({ embeds: [dmEmbed] }).catch(() => {
                console.log('No se pudo enviar mensaje directo al usuario.');
            });

            // Expulsar al usuario
            await member.kick(reason);

            // Embed de confirmación en el canal
            const kickEmbed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setTitle('<a:ban:1307446358441070602> ' + messages[lang].kickTitle)
                .setDescription(`**${userToKick.tag}** ${messages[lang].kickDescription}`)
                .addFields({ name: messages[lang].reasonTitle, value: `\`\`\`${reason}\`\`\``, inline: true })
                .setTimestamp()
                .setFooter({ text: `${messages[lang].kickedBy} ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            return message.channel.send({ embeds: [kickEmbed] });
        } catch (error) {
            console.error(error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].kickError}**`);
            return message.channel.send({ embeds: [errorEmbed] });
        }
    },
};
