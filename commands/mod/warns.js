// commands/admin/warns.js
const Warning = require('../../Schemas/warning');
const { EmbedBuilder } = require('discord.js');
const GuildSetup = require('../../Schemas/guildSetup');
const messages = require('./messages/warns'); // Asegúrate de importar el archivo de mensajes

module.exports = {
    name: 'warns',
    description: 'Muestra todas las advertencias de un miembro del servidor.',
    owner: false,
    category: 'Admin',
    async execute(message, args) {
        const guildId = message.guild.id;

        // Busca si el servidor ya completó la configuración
        const guild = await GuildSetup.findOne({ guildId: guildId });

        if (!guild || !guild.isSetupComplete) {
            const lang = guild ? guild.language : 'es'; // Usar español por defecto si no hay configuración
            return message.channel.send(messages[lang].setupRequired); // Mensaje de configuración requerido
        }

        const user = message.mentions.members.first();
        if (!user) {
            const lang = guild.language; // Obtener el idioma configurado
            return message.reply(messages[lang].mentionUser); // Mensaje de mencionar usuario
        }

        try {
            const warnings = await Warning.find({ GuildId: message.guild.id, UserId: user.id });
            if (warnings.length === 0) {
                const lang = guild.language; // Obtener el idioma configurado
                return message.reply(messages[lang].noWarnings.replace('{user}', user.user.tag)); // Mensaje de no advertencias
            }

            const embed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle(`${messages[guild.language].title.replace('{user}', user.user.tag)}`)
                .setDescription(messages[guild.language].description);

            warnings.forEach((warn, index) => {
                embed.addFields(
                    { name: `${messages[guild.language].warning} #${index + 1}`, value: `${messages[guild.language].reason}: ${warn.Reason}` }
                );
            });

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const lang = guild.language; // Obtener el idioma configurado
            message.reply(messages[lang].fetchError); // Mensaje de error
        }
    },
};
