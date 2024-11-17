const mongoose = require('mongoose');

const thresholdSchema = new mongoose.Schema({
    Warns: { 
        type: Number, 
        required: true,
        min: 1, // Asegurarse de que el umbral sea al menos 1
    },
    Timeout: { 
        type: Number, 
        required: function() { 
            return this.Action === 'timeout'; // Solo requerido si la acción es 'timeout'
        },
        min: 1 // Asegurarse de que el tiempo sea válido
    }
});

const actionSchema = new mongoose.Schema({
    Action: {
        type: String,
        required: true,
        enum: ['timeout', 'kick', 'ban'], // Solo permitir estas acciones
    },
    Thresholds: [thresholdSchema]
});

const warnActionSchema = new mongoose.Schema({
    GuildId: {
        type: String,
        required: true,
    },
    Actions: [actionSchema]
});

module.exports = mongoose.model('WarnAction', warnActionSchema);