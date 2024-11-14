const mongoose = require('mongoose');

const logSettingsSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    memberJoinChannelId: { type: String, default: null },
    memberLeaveChannelId: { type: String, default: null },
    messageDeleteChannelId: { type: String, default: null },
    messageUpdateChannelId: { type: String, default: null },
    messageSendChannelId: { type: String, default: null },
    roleCreateChannelId: { type: String, default: null },
    roleDeleteChannelId: { type: String, default: null },
    roleUpdateChannelId: { type: String, default: null },
    channelCreateChannelId: { type: String, default: null },
    channelDeleteChannelId: { type: String, default: null },
    channelEditChannelId: { type: String, default: null },
    userBanChannelId: { type: String, default: null },
    userKickChannelId: { type: String, default: null },
    userWarnChannelId: { type: String, default: null },
    userUnwarnChannelId: { type: String, default: null },
    userTimeoutChannelId: { type: String, default: null },

    // Propiedades booleanas para habilitar/deshabilitar logs
    messageDeleteEnabled: { type: Boolean, default: false },
    messageUpdateEnabled: { type: Boolean, default: false },
    messageSendEnabled: { type: Boolean, default: false },
    memberJoinEnabled: { type: Boolean, default: false },
    memberLeaveEnabled: { type: Boolean, default: false },
    roleCreateEnabled: { type: Boolean, default: false },
    roleDeleteEnabled: { type: Boolean, default: false },
    roleUpdateEnabled: { type: Boolean, default: false },
    channelCreateEnabled: { type: Boolean, default: false },
    channelDeleteEnabled: { type: Boolean, default: false },
    channelEditEnabled: { type: Boolean, default: false },
    userBanEnabled: { type: Boolean, default: false },
    userKickEnabled: { type: Boolean, default: false },
    userWarnEnabled: { type: Boolean, default: false },
    userUnwarnEnabled: { type: Boolean, default: false },
    userTimeoutEnabled: { type: Boolean, default: false },
});

module.exports = mongoose.model('LogSettings', logSettingsSchema);
