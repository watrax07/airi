const GuildSetup = require('../../Schemas/guildSetup');
const { EmbedBuilder } = require('discord.js');
const messages = require('./messages/ban'); // Asegúrate de importar el archivo de mensajes

module.exports = {
    name: 'ban',
    description: 'Banea a un usuario del servidor.',
    owner: false,
    category: 'Admin',
    async execute(message, args) {
        const guildId = message.guild.id;
        const guild = await GuildSetup.findOne({ guildId: guildId });

        if (!guild || !guild.isSetupComplete) {
            const lang = guild ? guild.language : 'en';
            return message.channel.send(messages[lang].setupRequired); // Mensaje de configuración requerido
        }

        const lang = guild.language;

        // Verificar si el usuario tiene permisos para banear
        if (!message.member.permissions.has('BanMembers')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].noPermissions}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar si el bot tiene permisos para banear
        if (!message.guild.members.me.permissions.has('BanMembers')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].boterror}**`);
            return message.channel.send({ embeds: [embed] });
        }

        const userToBan = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);
        if (!userToBan) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].mentionUser}**`);
            return message.channel.send({ embeds: [embed] });
        }

        const member = message.guild.members.cache.get(userToBan.id) || await message.guild.members.fetch(userToBan.id).catch(() => null);

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
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].cannotBanBot}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar si el miembro tiene un rango más alto que el bot
        if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].higherRank}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar si el usuario a banear tiene permisos más altos que el ejecutor
        if (member.permissions.has('BanMembers')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].cannotBanHigherPerms}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Obtener la razón del baneo
        const reason = args.slice(1).join(' ') || messages[lang].banReason;

        try {
            // Enviar mensaje directo al usuario baneado
            const dmEmbed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setTitle('<a:ban:1307446358441070602> ' + messages[lang].dmTitle)
                .setDescription(messages[lang].dmDescription.replace('{server}', message.guild.name))
                .addFields({ name: messages[lang].reasonTitle, value: `\`\`\`${reason}\`\`\`` })
                .setTimestamp();

            await userToBan.send({ embeds: [dmEmbed] }).catch(() => {
                console.log('No se pudo enviar mensaje directo al usuario.');
            });

            // Banear al usuario
            await member.ban({ reason });

            // Embed de confirmación en el canal
            const banEmbed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setTitle('<a:ban:1307446358441070602> ' + messages[lang].banTitle)
                .setDescription(`**${userToBan.tag}** ${messages[lang].banDescription}`)
                .addFields({ name: messages[lang].reasonTitle, value: `\`\`\`${reason}\`\`\``, inline: true })
                .setTimestamp()
                .setFooter({ text: `${messages[lang].bannedBy} ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            return message.channel.send({ embeds: [banEmbed] });
        } catch (error) {
            console.error(error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].banError}**`);
            return message.channel.send({ embeds: [errorEmbed] });
        }
    },
};
