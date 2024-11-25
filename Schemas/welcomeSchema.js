const mongoose = require('mongoose');

const welcomeSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true }, // ID único del servidor
    enabled: { type: Boolean, default: false }, // Activar/desactivar mensajes de bienvenida
    channelId: { type: String, default: null }, // ID del canal donde se enviará el mensaje de bienvenida

    // Configuración del mensaje antes del embed
    welcomeMessage: { 
        type: String, 
        default: null, // Mensaje adicional fuera del embed
    },

    // Configuración del embed
    title: { type: String, default: 'Bienvenido' }, // Título del embed
    description: { 
        type: String, 
        default: '¡Hola {user}, bienvenido a {channel}!' // Plantilla por defecto
    }, 
    color: { type: String, default: '#00ff00' }, // Color del embed (hexadecimal)
    thumbnail: { type: String, default: null }, // URL de la imagen en miniatura del embed
    image: { type: String, default: null }, // URL de la imagen principal del embed
    footer: { type: String, default: null }, // Texto del footer del embed
    timestamp: { type: Boolean, default: false }, // Incluir timestamp en el embed (true/false)

    // Configuración de roles opcionales para asignar a nuevos miembros
    roles: { 
        type: [String], 
        default: [] // IDs de roles a asignar automáticamente
    },
});

module.exports = mongoose.model('WelcomeSettings', welcomeSchema);
