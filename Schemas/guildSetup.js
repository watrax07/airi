const mongoose = require('mongoose');

const guildSetupSchema = new mongoose.Schema({
    guildId: String,
    isSetupComplete: { type: Boolean, default: false },
    language: { type: String, default: 'es' }, 
    prefix: { type: String, default: '!' }
});

module.exports = mongoose.model('GuildSetup', guildSetupSchema);
