

const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    GuildId: { type: String, required: true },
    UserId: { type: String, required: true },
});

const Testing = mongoose.model('Testing', testSchema);
module.exports = Testing;
