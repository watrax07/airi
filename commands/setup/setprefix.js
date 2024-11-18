const { EmbedBuilder } = require('discord.js');
const GuildSetup = require('../../Schemas/guildSetup');

module.exports = {
    name: 'setprefix',
    description: 'Cambia el prefijo del bot en este servidor',
    category: 'setup',
    async execute(message, args) {
        const guildId = message.guild.id;
        const guild = await GuildSetup.findOne({ guildId });

        if (!guild) {
            return message.channel.send('Este servidor aún no ha configurado el bot. Usa `!setup` primero.');
        }

        if (!message.member.permissions.has('ADMINISTRATOR')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> No tienes permisos para cambiar el prefijo.');
            return message.channel.send({ embeds: [embed] });
        }

        const newPrefix = args[0];
        if (!newPrefix || newPrefix.length > 5) {
            return message.channel.send('Por favor, proporciona un prefijo válido (máximo 5 caracteres).');
        }

        guild.prefix = newPrefix;
        await guild.save();

        const embed = new EmbedBuilder()
            .setColor('#f3b0ff')
            .setDescription(`El prefijo se ha cambiado correctamente a: \`${newPrefix}\``);

        return message.channel.send({ embeds: [embed] });
    }
};
