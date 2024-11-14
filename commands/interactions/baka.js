/*const client = require('nekos.life');
const neko = new client();
const { EmbedBuilder } = require('discord.js');
const GuildSetup = require('../../Schemas/guildSetup'); // Importa el modelo de la configuración de la guild

module.exports = {
    name: 'hug',
    description: 'Abraza a alguien.',
    owner: false,
    category: 'Interact',
    async execute(interaction) {
        const guildId = interaction.guild.id;

        // Verificar si el servidor ha ejecutado /setup
        const guild = await GuildSetup.findOne({ guildId });
        if (!guild || !guild.isSetupComplete) {
            return interaction.reply({ content: 'Debes ejecutar el comando /setup antes de usar este comando.', ephemeral: true });
        }

        try {
            const image = await neko.sfw.hug();
            const userToHug = interaction.options.getUser('usuario') || 'alguien';

            const mbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle(`${interaction.user.username} abrazó a ${userToHug}!`)
                .setImage(image.url)
                .setTimestamp();

            await interaction.reply({ embeds: [mbed] });
        } catch (error) {
            console.error(error);
            await interaction.reply('Ocurrió un error al intentar ejecutar el comando. 😢');
        }
    },
};
*/