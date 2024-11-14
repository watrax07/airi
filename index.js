require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials, SlashCommandBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
const config = require("./config.json")
const client = new Client({
    partials: [
      Partials.Message, 
      Partials.Channel, 
      Partials.GuildMember,
      Partials.Reaction, 
    ],
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildInvites, 
      GatewayIntentBits.GuildMessages, 
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent,
    ],
  });
client.commands = new Collection();
client.slashCommands = new Map();
require('./handlers/commandHandler.js')(client);
require('./handlers/eventHandler.js')(client);
const loadCommands = (dir) => {
    const commandFiles = fs.readdirSync(dir);
    for (const file of commandFiles) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {
            const command = require(filePath);
            if (command.data instanceof SlashCommandBuilder) {
                client.slashCommands.set(command.data.name, command);

                if (command.data.dm_permission !== false) {
                    commands.push(command.data.toJSON());
                }
            } else {
                client.slashCommands.set(command.data.name, command);
                commands.push(command.data);
            }
        }
    }
};

const commands = [];
loadCommands(path.join(__dirname, 'slashCommands')); 
const rest = new REST({ version: '9' }).setToken(config.token);
(async () => {
    try {
        await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
    } catch (error) {
        console.error(error);
    }
})();

client.login(config.token)
    .then(() => console.log('Bot conectado con éxito.'))
    .catch(err => console.error('Error al conectar el bot:', err));