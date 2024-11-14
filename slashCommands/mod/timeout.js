// commands/admin/timeout.js
const { SlashCommandBuilder } = require('discord.js');
const GuildSetup = require('../../Schemas/guildSetup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Aplica un timeout a un miembro del servidor.')
        .addUserOption(option => option.setName('usuario').setDescription('El usuario a poner en timeout').setRequired(true))
        .addStringOption(option =>
            option.setName('duración')
                .setDescription('Duración del timeout (ej: 1m o 1d)')
                .setRequired(true)),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const guild = await GuildSetup.findOne({ guildId: guildId });
        if (!guild || !guild.isSetupComplete) {
            return interaction.reply({ content: 'Debes ejecutar el comando !setup antes de usar este comando.', ephemeral: true });
        }
        const user = interaction.options.getUser('usuario');
        const duration = interaction.options.getString('duración');

        const value = parseInt(duration.slice(0, -1));
        const unit = duration.slice(-1);
        let totalMilliseconds = 0;

        if (isNaN(value) || value <= 0) {
            return interaction.reply('¡Los valores de tiempo deben ser mayores a cero!');
        }

        if (unit === 'd') {
            totalMilliseconds = value * 24 * 60 * 60 * 1000; // Convertir días a milisegundos
        } else if (unit === 'm') {
            totalMilliseconds = value * 60 * 1000; // Convertir minutos a milisegundos
        } else {
            return interaction.reply('¡Formato incorrecto! Usa "d" para días y "m" para minutos (ej: 1d o 30m).');
        }

        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.timeout(totalMilliseconds, `Timeout por ${duration}`);
            await interaction.reply(`¡${user.tag} ha sido puesto en timeout por ${duration}!`);
        } catch (error) {
            console.error(error);
            await interaction.reply('Hubo un error al intentar aplicar el timeout. Asegúrate de que tengo permisos para hacerlo.');
        }
    },
};
