// commands/admin/kick.js
const GuildSetup = require('../../Schemas/guildSetup');
const { EmbedBuilder } = require('discord.js');
const messages = require('./messages/kick'); // Asegúrate de importar el archivo de mensajes

module.exports = {
    name: 'kick',
    description: 'Expulsa a un usuario del servidor.',
    owner: false,
    category: 'Admin',
    async execute(message, args) {
        const guildId = message.guild.id;

        // Busca si el servidor ya completó la configuración
        const guild = await GuildSetup.findOne({ guildId: guildId });

        if (!guild || !guild.isSetupComplete) {
            const lang = guild ? guild.language : 'es';
            return message.channel.send(messages[lang].setupRequired); // Mensaje de configuración requerido
        }

        if (!message.member.permissions.has('KickMembers')) {
            const lang = guild.language; // Obtener el idioma configurado
            return message.reply(messages[lang].noPermissions); // Mensaje de permisos
        }

        const userToKick = message.mentions.users.first();
        if (!userToKick) {
            const lang = guild.language; // Obtener el idioma configurado
            return message.reply(messages[lang].mentionUser); // Mensaje de mencionar usuario
        }

        const member = message.guild.members.cache.get(userToKick.id);
        if (member) {
            try {
                await member.kick('Has sido expulsado por un administrador.');

                const lang = guild.language; 
                const kickEmbed = new EmbedBuilder()
                    .setColor('#f3b0ff')
                    .setTitle(messages[lang].kickTitle) 
                    .setDescription(`**${userToKick.tag}** ${messages[lang].kickDescription}`) // Descripción en el idioma seleccionado
                    .setTimestamp()
                    .setFooter({ text: `${messages[lang].kickedBy} ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

                message.channel.send({ embeds: [kickEmbed] });
            } catch (error) {
                console.error(error);
                const lang = guild.language; // Obtener el idioma configurado
                message.reply(messages[lang].kickError); // Mensaje de error
            }
        } else {
            const lang = guild.language; // Obtener el idioma configurado
            message.reply(messages[lang].memberNotFound); // Mensaje de miembro no encontrado
        }
    },
};
