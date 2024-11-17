const GuildSetup = require('../../Schemas/guildSetup');
const { EmbedBuilder } = require('discord.js');
const messages = require('./messages/untimeout'); // Asegúrate de importar el archivo de mensajes

module.exports = {
    name: 'untimeout',
    description: 'Elimina el timeout de un miembro del servidor.',
    owner: false,
    category: 'Admin',
    async execute(message, args) {
        const guildId = message.guild.id;

        // Busca si el servidor ya completó la configuración
        const guild = await GuildSetup.findOne({ guildId: guildId });

        if (!guild || !guild.isSetupComplete) {
            const lang = guild ? guild.language : 'en'; // Usar español por defecto si no hay configuración
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].setupRequired}**`);
            return message.channel.send({ embeds: [embed] });
        }

        const lang = guild.language;

        // Verificar si el usuario tiene permisos para eliminar timeout
        if (!message.member.permissions.has('ModerateMembers')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].noPermissions}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar si el bot tiene permisos para eliminar timeout
        if (!message.guild.members.me.permissions.has('ModerateMembers')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].botError}**`);
            return message.channel.send({ embeds: [embed] });
        }

        const userToUntimeout = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);

        if (!userToUntimeout) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].mentionUser}**`);
            return message.channel.send({ embeds: [embed] });
        }

        try {
            // Verificar si el usuario fue encontrado y tiene una propiedad `user`
            if (!userToUntimeout || !userToUntimeout.user) {
                const embed = new EmbedBuilder()
                    .setColor('#f3b0ff')
                    .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].mentionUser}**`);
                return message.channel.send({ embeds: [embed] });
            }
        
            // Verificar si el usuario tiene un timeout activo
            if (!userToUntimeout.communicationDisabledUntil || userToUntimeout.communicationDisabledUntilTimestamp <= Date.now()) {
                const embed = new EmbedBuilder()
                    .setColor('#f3b0ff')
                    .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].noActiveTimeout.replace('{user}', userToUntimeout.user.tag)}**`);
                return message.channel.send({ embeds: [embed] });
            }
        
            const removeReason = messages[lang].timeoutRemovedReason
                .replace('{user}', message.author.tag);
        
            await userToUntimeout.timeout(null, removeReason);
        
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<:untimeout:1307470217013887017> ' + `**${messages[lang].timeoutRemoved.replace('{user}', userToUntimeout.user.tag)}**`);
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
