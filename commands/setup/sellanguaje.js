const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const GuildSetup = require('../../Schemas/guildSetup');
const messages = require('./messages/setlanguage.js'); // Archivo de mensajes para este comando

let activeCollectors = new Map(); // Map para almacenar colectores activos por canal

module.exports = {
    name: 'setlanguage',
    description: 'Cambia el idioma del bot en este servidor',
    category: 'setup',
    async execute(message) {
        const guildId = message.guild.id;
        const guild = await GuildSetup.findOne({ guildId });

        if (!guild) {
            return message.channel.send('Este servidor aún no ha configurado el bot. Usa `!setup` primero.');
        }

        if (!message.member.permissions.has('ADMINISTRATOR')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> No tienes permisos para cambiar el idioma.');
            return message.channel.send({ embeds: [embed] });
        }

        // Finalizar colectores previos en este canal
        const previousCollector = activeCollectors.get(message.channel.id);
        if (previousCollector) {
            // Deshabilitar el menú visualmente
            await disableMenu(previousCollector.message);
            previousCollector.collector.stop(); // Detener colector previo si está activo
        }

        const uniqueId = `setlanguage-${Date.now()}`; // Generar un ID único
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(uniqueId)
                .setPlaceholder('Selecciona un idioma')
                .addOptions([
                    { label: 'Español', value: 'es', emoji: '🇪🇸' },
                    { label: 'English', value: 'en', emoji: '<:usa:1291860272784343091>' },
                    { label: 'Français', value: 'fr', emoji: '<:fr:1291860268812603565>' },
                ])
        );

        const embed = new EmbedBuilder()
            .setColor('#f3b0ff')
            .setTitle('Cambio de Idioma')
            .setDescription('🇪🇸 Por favor, selecciona el idioma que prefieres para el bot.\n<:usa:1291860272784343091> Please select the language you prefer for the bot.\n<:fr:1291860268812603565> Veuillez sélectionner la langue que vous préférez pour le bot.');

        const sentMessage = await message.channel.send({
            embeds: [embed],
            components: [row],
        });

        const filter = (interaction) => interaction.customId === uniqueId && interaction.user.id === message.author.id;
        const collector = sentMessage.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', time: 60000 });

        // Guardar el colector activo junto con el mensaje
        activeCollectors.set(message.channel.id, { collector, message: sentMessage });

        collector.on('collect', async (interaction) => {
            try {
                const selectedLanguage = interaction.values[0];
                guild.language = selectedLanguage;
                await guild.save();

                // Actualiza el mensaje del bot con el nuevo idioma seleccionado
                const updatedEmbed = new EmbedBuilder()
                    .setColor('#f3b0ff')
                    .setDescription(messages[selectedLanguage].success.replace('{language}', selectedLanguage));

                await interaction.update({
                    embeds: [updatedEmbed],
                    components: [], // Desactivar el menú después de seleccionar
                });

                collector.stop(); // Finaliza el colector después de la interacción
            } catch (error) {
                console.error('Error manejando la interacción:', error);
                await interaction.reply({
                    content: 'Hubo un error al cambiar el idioma. Por favor, inténtalo nuevamente.',
                    ephemeral: true,
                });
            }
        });

        collector.on('end', async () => {
            activeCollectors.delete(message.channel.id); // Limpiar colector activo
            await disableMenu(sentMessage); // Deshabilitar el menú visualmente
        });
    },
};

// Función para deshabilitar un menú
async function disableMenu(message) {
    if (!message || !message.editable) return;

    const components = message.components.map((row) => {
        const updatedRow = ActionRowBuilder.from(row);
        updatedRow.components.forEach((component) => {
            if (component.setDisabled) component.setDisabled(true);
        });
        return updatedRow;
    });

    await message.edit({ components }).catch((err) => console.error('Error deshabilitando menú:', err));
}
