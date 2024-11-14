// utils/checkSetup.js
const GuildSetup = require('../Schemas/guildSetup');

async function checkSetup(interaction) {
    const guildId = interaction.guild.id;
    const guild = await GuildSetup.findOne({ guildId });

    // Verificar si la configuración está completa
    if (!guild || !guild.isSetupComplete) {
        await interaction.reply({ content: 'Debes ejecutar el comando !setup antes de usar este comando.', ephemeral: true });
        return false; // Si no se ha completado el setup, retorna false
    }

    return true; // Si el setup está completo, retorna true
}

module.exports = { checkSetup };
