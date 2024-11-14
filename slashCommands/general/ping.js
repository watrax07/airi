// slashCommands/admin/adminSlashCommand.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Este es un comando de administrador.'),
  async execute(interaction) {
    await interaction.reply('Comando de administrador ejecutado.');
  },
};
