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
        if (member) {
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
        } else {
            const lang = guild.language; // Obtener el idioma configurado
            message.reply(messages[lang].memberNotFound); // Mensaje de miembro no encontrado
        }
    },
}