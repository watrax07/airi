// commands/admin/timeout.js
const GuildSetup = require('../../Schemas/guildSetup');
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
            const lang = guild ? guild.language : 'es'; // Usar español por defecto si no hay configuración
            return message.channel.send(messages[lang].setupRequired); // Mensaje de configuración requerido
        }

        const user = message.mentions.members.first();
        if (!user) {
            const lang = guild.language; // Obtener el idioma configurado
            return message.reply(messages[lang].mentionUser); // Mensaje de mencionar usuario
        }

        // Variables para almacenar el tiempo total en milisegundos
        let totalMilliseconds = 0;

        // Iterar sobre los argumentos
        for (const arg of args.slice(1)) {
            const value = parseInt(arg.slice(0, -1)); // Obtener el número
            const unit = arg.slice(-1); // Obtener la unidad

            if (isNaN(value) || value <= 0) {
                const lang = guild.language; // Obtener el idioma configurado
                return message.reply(messages[lang].invalidValue); // Mensaje de valor inválido
            }

            if (unit === 'd') {
                totalMilliseconds += value * 24 * 60 * 60 * 1000; // Convertir días a milisegundos
            } else if (unit === 'm') {
                totalMilliseconds += value * 60 * 1000; // Convertir minutos a milisegundos
            } else {
                const lang = guild.language; // Obtener el idioma configurado
                return message.reply(messages[lang].invalidFormat); // Mensaje de formato incorrecto
            }
        }

        try {
            await user.timeout(totalMilliseconds, `Timeout por ${totalMilliseconds / 1000 / 60} minutos.`);
            const lang = guild.language; // Obtener el idioma configurado
            message.reply(messages[lang].timeoutSuccess.replace('{user}', user.user.tag).replace('{duration}', totalMilliseconds / 1000 / 60)); // Mensaje de éxito
        } catch (error) {
            console.error(error);
            const lang = guild.language; // Obtener el idioma configurado
            message.reply(messages[lang].timeoutError); // Mensaje de error
        }
    },
};
