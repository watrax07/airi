/*const { MessageEmbed } = require('discord.js'); // Asegúrate de tener estas importaciones
const nekoClient = require('nekos.life');
const { sfw } = new nekoClient() 

module.exports = {
    name: 'hug',
    description: 'Envía un abrazo a alguien.',
    owner: false,
    category: 'Interact',
    async execute(message, args) {
        const guildId = message.guild.id;

        // Verificar si el servidor ha ejecutado /setup
        const guild = await GuildSetup.findOne({ guildId });
        if (!guild || !guild.isSetupComplete) {
            return message.reply('Debes ejecutar el comando /setup antes de usar este comando.');
        }

        try {
            const { url } = await neko.sfw.hug(); // Usa el método hug para obtener la URL
            const userToHug = message.mentions.users.first() || 'alguien'; // Obtiene el usuario mencionado o "alguien"

            const embed = new MessageEmbed() // Crea un nuevo embed
                .setColor('#ff0000') // Color del embed
                .setTitle(`${message.author.username} le envió un abrazo a ${userToHug.username || userToHug}!`) // Título del embed
                .setImage(url) // Establece la imagen del embed
                .setTimestamp(); // Establece la fecha y hora

            await message.channel.send({ embeds: [embed] }); // Envía el embed al canal
        } catch (error) {
            console.error(error);
            message.reply('Ocurrió un error al intentar ejecutar el comando. 😢'); // Respuesta de error
        }
    },
};
*/