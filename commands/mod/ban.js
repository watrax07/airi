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

        if (!message.member.permissions.has('BanMembers')) {
            const lang = guild.language; // Obtener el idioma configurado
            return message.reply(messages[lang].noPermissions); // Mensaje de permisos
        }

        const userToBan = message.mentions.users.first();
        if (!userToBan) {
            const lang = guild.language; // Obtener el idioma configurado
            return message.reply(messages[lang].mentionUser); // Mensaje de mencionar usuario
        }

        const member = message.guild.members.cache.get(userToBan.id);

        // Verificar si el miembro es un bot
        if (member.user.bot) {
            const lang = guild.language; // Obtener el idioma configurado
            return message.reply(messages[lang].cannotBanBot); // Mensaje si es un bot
        }

        // Verificar si el miembro tiene un rango más alto que el bot
        if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
            const lang = guild.language; // Obtener el idioma configurado
            return message.reply(messages[lang].higherRank); // Mensaje si tiene un rango superior
        }

        // Verificar si el usuario a banear tiene permisos más altos que el ejecutor
        if (!message.guild.members.cache.get(userToBan.id).permissions.has('BanMembers')) {
            const lang = guild.language; // Obtener el idioma configurado
            return message.reply(messages[lang].cannotBanHigherPerms); // Mensaje si el usuario tiene permisos más altos
        }

        try {
            await member.ban({ reason: messages[lang].banReason }); // Mensaje de razón de baneo

            const banEmbed = new EmbedBuilder()
                .setColor('#f3b0ff') // Rojo
                .setTitle(messages[lang].banTitle) // Título en el idioma seleccionado
                .setDescription(`**${userToBan.tag}** ${messages[lang].banDescription}`) // Descripción en el idioma seleccionado
                .addField(messages[lang].reasonTitle, messages[lang].banReason, true) // Campo de razón
                .setTimestamp()
                .setFooter({ text: `${messages[lang].bannedBy} ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            message.channel.send({ embeds: [banEmbed] });
        } catch (error) {
            console.error(error);
            const lang = guild.language; // Obtener el idioma configurado
            message.reply(messages[lang].banError); // Mensaje de error
        }
    },
}
