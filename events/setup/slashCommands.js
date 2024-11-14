// commands.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const hugCommand = require('../../slashCommands/interaction/hug'); 

const commands = new Map();

commands.set(hugCommand.data.name, hugCommand);

module.exports = commands;
