// commands/admin/unwarn.js
const { SlashCommandBuilder } = require('discord.js');
const Warning = require('../../Schemas/warning');
const GuildSetup = require('../../Schemas/guildSetup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Elimina una advertencia de un miembro del servidor.')
        .addUserOption(option => option.setName('usuario').setDescription('El usuario del que quieres eliminar la advertencia').setRequired(true))
        .addIntegerOption(option => option.setName('id').setDescription('ID de la advertencia a eliminar').setRequired(true)),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const guild = await GuildSetup.findOne({ guildId: guildId });
        if (!guild || !guild.isSetupComplete) {
            return interaction.reply({ content: 'Debes ejecutar el comando !setup antes de usar este comando.', ephemeral: true });
        }
        const user = interaction.options.getUser('usuario');
        const warningId = interaction.options.getInteger('id');

        try {
            const result = await Warning.deleteOne({ GuildId: interaction.guild.id, UserId: user.id, _id: warningId });
            if (result.deletedCount > 0) {
                await interaction.reply(`¡Advertencia de ${user.tag} eliminada!`);
            } else {
                await interaction.reply('No se encontró la advertencia.');
            }
        } catch (error) {
            console.error(error);
            await interaction.reply('Hubo un error al intentar eliminar la advertencia.');
        }
    },
};
