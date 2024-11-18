const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

// Mapa global para rastrear menús activos por canal
const activeMenus = new Map();

module.exports = {
    // Función para mostrar un nuevo menú
    async showMenu(message, embed, components, collectorOptions, onCollect, onEnd) {
        const channelId = message.channel.id;

        // Verificar si hay un menú activo en este canal
        const activeMenu = activeMenus.get(channelId);
        if (activeMenu) {
            // Desactivar componentes del menú anterior
            try {
                await activeMenu.message.edit({
                    components: disableComponents(activeMenu.message.components),
                });
                activeMenu.collector.stop(); // Detener colector anterior
            } catch (error) {
                console.error('Error desactivando menú activo:', error);
            }
        }

        // Enviar el nuevo menú
        const sentMessage = await message.channel.send({ embeds: [embed], components });

        // Crear colector para el nuevo menú
        const collector = sentMessage.createMessageComponentCollector(collectorOptions);

        // Registrar el nuevo menú en el mapa
        activeMenus.set(channelId, { message: sentMessage, collector });

        // Manejar eventos del colector
        collector.on('collect', async (interaction) => {
            if (onCollect) await onCollect(interaction, sentMessage);
        });

        collector.on('end', () => {
            // Desactivar componentes del menú al finalizar
            try {
                sentMessage.edit({ components: disableComponents(sentMessage.components) });
            } catch (error) {
                console.error('Error desactivando componentes al finalizar:', error);
            }
            // Eliminar el menú del mapa
            activeMenus.delete(channelId);
            if (onEnd) onEnd();
        });

        return sentMessage;
    },
};

// Función para desactivar componentes
function disableComponents(components) {
    return components.map((row) =>
        new ActionRowBuilder().addComponents(
            row.components.map((component) => (component.setDisabled ? component.setDisabled(true) : component))
        )
    );
}
