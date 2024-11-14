// commands/admin/kick.js
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const GuildSetup = require('../../Schemas/guildSetup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un miembro del servidor.')
        .addUserOption(option => option.setName('usuario').setDescription('El usuario a expulsar').setRequired(true))
        .addStringOption(option =>
            option.setName('razón')
                .setDescription('Razón de la expulsión')
                .setRequired(false)),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const guild = await GuildSetup.findOne({ guildId: guildId });
        if (!guild || !guild.isSetupComplete) {
            return interaction.reply({ content: 'Debes ejecutar el comando !setup antes de usar este comando.', ephemeral: true });
        }

        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razón') || 'Sin razón proporcionada';

        const member = await interaction.guild.members.fetch(user.id);

        if (member) {
            await member.kick(reason);
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setTitle('<:Animepop:1291860266975232032> ¡Usuario Expulsado!')
                .setDescription(`¡${user.tag} ha sido expulsado!\n**Razón:** ${reason}`);
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply('¡No se pudo encontrar al usuario en el servidor!');
        }
    },
};
