// events/client/ready.js
const mongoose = require('mongoose');
const config = require('../../config.json'); // Importa la configuración

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`¡Bot ${client.user.tag} está en línea y listo!`);

        // Establece un mensaje de actividad del bot
        client.user.setActivity('Configurando logs 📜', { type: 'PLAYING' });

        // Conectarse a MongoDB sin las opciones deprecadas
        mongoose.connect(config.mongopass, {
            serverSelectionTimeoutMS: 30000, // Aumenta el tiempo de espera a 30 segundos
            socketTimeoutMS: 45000,          // Tiempo de espera de sockets a 45 segundos
            family: 4                        // Usa IPv4 para conexiones de red
        }).then(() => {
            console.log('Conexión exitosa a MongoDB');
        }).catch((error) => {
            console.error('Error al conectar a MongoDB:', error);
        });
    },
};
