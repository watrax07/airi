// Schemas/warning.js
const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
    GuildId: {
        type: String,
        required: true,
    },
    UserId: {
        type: String,
        required: true,
    },
    Reason: {
        type: String,
        required: true,
    },
    Date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Warning', warningSchema);
