const { Schema, model } = require('mongoose');

// Definir el esquema para almacenar el conteo de abrazos
const hugSchema = new Schema({
    userId: {
        type: String, // ID del usuario en Discord
        required: true,
        unique: true // Nos aseguramos de que cada usuario tenga un único registro
    },
    hugsCount: {
        type: Number, // Contador de abrazos
        default: 0
    }
});

module.exports = model('Hug', hugSchema);
