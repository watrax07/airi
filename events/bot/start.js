const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        console.log(`Bot se unió al servidor: ${guild.name}`); // Asegúrate de que guild.name esté presente
        try {
            // Asegúrate de que el objeto guild se esté recibiendo correctamente
            if (!guild || !guild.name) {
                console.error('El objeto guild no se recibió correctamente.');
                return;
            }

            // Buscar un canal de texto donde se pueda enviar un mensaje
            const channel = guild.channels.cache.find(ch => ch.type === 'GUILD_TEXT' && ch.permissionsFor(guild.members.me).has('SEND_MESSAGES'));

            // Verifica si se encontró un canal de texto
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`Hello! Thank you for adding me to **${guild.name}**!`)
                    .setDescription('I am here to assist you. Use `!setup` to configure me.')
                    .setThumbnail(guild.iconURL())
                    .setFooter({ text: 'If you have any questions, feel free to ask.' })
                    .setTimestamp();

                // Envía el mensaje embed
                await channel.send({ embeds: [embed] });
                console.log(`Mensaje enviado a ${guild.name} en el canal ${channel.name}.`);
            } else {
                console.log('No se encontró un canal de texto donde enviar el mensaje.');
            }
        } catch (error) {
            console.error(`Error al enviar el mensaje en ${guild.name}:`, error);
        }
    },
};
