// commands/admin/warns.js
const { SlashCommandBuilder } = require('discord.js');
const Warning = require('../../Schemas/warning');
const GuildSetup = require('../../Schemas/guildSetup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warns')
        .setDescription('Muestra las advertencias de un miembro del servidor.')
        .addUserOption(option => option.setName('usuario').setDescription('El usuario del que quieres ver las advertencias').setRequired(true)),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const guild = await GuildSetup.findOne({ guildId: guildId });
        if (!guild || !guild.isSetupComplete) {
            return interaction.reply({ content: 'Debes ejecutar el comando !setup antes de usar este comando.', ephemeral: true });
        }
        const user = interaction.options.getUser('usuario');
        const warnings = await Warning.find({ GuildId: interaction.guild.id, UserId: user.id });

        if (warnings.length === 0) {
            return interaction.reply(`¡${user.tag} no tiene advertencias!`);
        }

        const warningMessages = warnings.map((warn, index) => `**ID:** ${warn._id} - **Razón:** ${warn.Reason}`).join('\n');

        await interaction.reply(`Advertencias de ${user.tag}:\n${warningMessages}`);
    },
};
