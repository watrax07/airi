const { SlashCommandBuilder } = require('discord.js');
const GuildSetup = require('../../Schemas/guildSetup');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un usuario.') // Descripción por defecto
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario a banear.')
                .setRequired(true)),
    async execute(interaction) {

        const guildId = interaction.guild.id;
        const guild = await GuildSetup.findOne({ guildId: guildId });
        if (!guild || !guild.isSetupComplete) {
            return interaction.reply({ content: 'Debes ejecutar el comando !setup antes de usar este comando.', ephemeral: true });
        }

        if (!interaction.member.permissions.has('BanMembers')) {
            return interaction.reply({ content: 'No tienes permisos para banear usuarios.', ephemeral: true });
        }

        const userToBan = interaction.options.getUser('usuario');
        const member = interaction.guild.members.cache.get(userToBan.id);

        if (member) {
            try {
                await member.ban({ reason: 'Baneado por un administrador.' });

                const banEmbed = new EmbedBuilder()
                    .setColor('#f3b0ff') // Rojo
                    .setTitle('<:Animepop:1291860266975232032> Usuario Baneado')
                    .setDescription(`**${userToBan.tag}** ha sido baneado correctamente.`)
                    .addFields({ name: 'Razón', value: 'Baneado por un administrador.', inline: true })
                    .setTimestamp()
                    .setFooter({ text: `Baneado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

                await interaction.reply({ embeds: [banEmbed] });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Ocurrió un error al intentar banear al usuario.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'No se pudo encontrar al miembro especificado.', ephemeral: true });
        }
    },
};
