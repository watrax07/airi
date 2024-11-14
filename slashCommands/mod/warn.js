// commands/admin/warn.js
const { SlashCommandBuilder } = require('discord.js');
const Warning = require('../../Schemas/warning');
const GuildSetup = require('../../Schemas/guildSetup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Advierte a un miembro del servidor.')
        .addUserOption(option => option.setName('usuario').setDescription('El usuario a advertir').setRequired(true))
        .addStringOption(option =>
            option.setName('razón')
                .setDescription('Razón de la advertencia')
                .setRequired(false)),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const guild = await GuildSetup.findOne({ guildId: guildId });
        if (!guild || !guild.isSetupComplete) {
            return interaction.reply({ content: 'Debes ejecutar el comando !setup antes de usar este comando.', ephemeral: true });
        }
        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razón') || 'Sin razón proporcionada';

        try {
            await Warning.create({
                GuildId: interaction.guild.id,
                UserId: user.id,
                Reason: reason
            });
            await interaction.reply(`¡${user.tag} ha sido advertido! Razón: ${reason}`);
        } catch (error) {
            console.error(error);
            await interaction.reply('Hubo un error al intentar advertir al usuario.');
        }
    },
};
