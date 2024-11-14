const { EmbedBuilder } = require('discord.js');
const kakashi = require('anime-actions');
const GuildSetup = require('../../Schemas/interactions/hug');
const SetupGuild = require('../../Schemas/guildSetup');
const messages = require('./messages/hug'); // Importar los mensajes

module.exports = {
    name: 'hug',
    description: 'Abraza a alguien.',
    owner: false,
    category: 'Interact',
    async execute(message, args) {
        const guildId = message.guild.id;

        // Buscar la configuración de la guild
        const guildConfig = await SetupGuild.findOne({ guildId: guildId });

        if (!guildConfig || !guildConfig.isSetupComplete) {
            const lang = guildConfig ? guildConfig.language : 'es'; // Usar español por defecto si no hay configuración
            return message.channel.send(messages[lang].setupRequired); // Mensaje de configuración requerido
        }

        // Obtener el idioma del servidor
        const lang = guildConfig.language || 'es';
        const langMessages = messages[lang];

        // Verificar que se mencione a un usuario
        if (args.length === 0) {
            return message.reply(langMessages.mentionUser);
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply(langMessages.validUser);
        }

        try {
            // Buscar datos de interacción (abrazos)
            let guildData = await GuildSetup.findOne({ guildId: guildId });
            if (!guildData) {
                guildData = new GuildSetup({ guildId: guildId, userIds: {} });
            }

            // Obtener el número de abrazos del usuario o inicializar a 0
            const hugs = guildData.userIds[user.id] || 0;

            // Incrementar el número de abrazos
            guildData.userIds[user.id] = hugs + 1;
            await guildData.save(); // Guardar los cambios en la base de datos

            // Crear el embed
            const mbed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setTitle(langMessages.hugMessage.replace('{author}', message.author.username).replace('{user}', user.username))
                .setImage(await kakashi.hug())
                .setFooter({ text: langMessages.hugsCount.replace('{count}', hugs + 1) })
                .setTimestamp();

            // Enviar el embed al canal
            await message.channel.send({ embeds: [mbed] });
        } catch (error) {
            console.error(error);
            message.reply(langMessages.error);
        }
    },
};
