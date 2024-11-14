const testing = require("../../Schemas/test");

module.exports = {
    name: 'ping',
    description: 'Responde con pong!',
    owner: false, // Cambia a true si solo el dueño puede usarlo
    category: 'General',
    async execute(message, args) {
        const guildId = message.guild.id; // Obtener el ID del servidor
        const userId = message.author.id; // Obtener el ID del autor del mensaje

        testing.findOne({ GuildId: guildId }).then((data) => {
            if (!data) {
                testing.create({
                    GuildId: guildId,
                    UserId: userId,
                }).then(() => {
                    message.channel.send('¡Pong!');
                });
            } else {
                console.log(data);
                message.channel.send('¡Ya existe un registro para este servidor!');
            }
        }).catch(err => {
            console.error('Error al acceder a la base de datos:', err);
            message.channel.send('Hubo un error al acceder a la base de datos.');
        });
    },
};
