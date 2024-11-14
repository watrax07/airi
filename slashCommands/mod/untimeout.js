// commands/admin/untimeout.js
const { SlashCommandBuilder } = require('discord.js');
const GuildSetup = require('../../Schemas/guildSetup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Elimina el timeout de un miembro del servidor.')
        .addUserOption(option => option.setName('usuario').setDescription('El usuario del que deseas quitar el timeout').setRequired(true)),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const guild = await GuildSetup.findOne({ guildId: guildId });
        if (!guild || !guild.isSetupComplete) {
            return interaction.reply({ content: 'Debes ejecutar el comando !setup antes de usar este comando.', ephemeral: true });
        }
        const user = interaction.options.getUser('usuario');

        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.timeout(null, 'Timeout eliminado');
            await interaction.reply(`¡El timeout de ${user.tag} ha sido eliminado!`);
        } catch (error) {
            console.error(error);
            await interaction.reply('Hubo un error al intentar eliminar el timeout. Asegúrate de que tengo permisos para hacerlo.');
        }
    },
};
