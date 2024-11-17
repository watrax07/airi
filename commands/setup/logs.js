const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, StringSelectMenuBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup');

module.exports = {
    name: 'setuplogs',
    description: 'Configura los logs del servidor',
    async execute(message) {
        try {
            const guildId = message.guild.id;

            const guild = await GuildSetup.findOne({ guildId });
            if (!guild || !guild.isSetupComplete) {
                return message.channel.send('Por favor, completa la configuración del servidor antes de configurar los logs.');
            }

            let logSettings = await LogSettings.findOne({ guildId }) || new LogSettings({ guildId });
            if (!logSettings._id) await logSettings.save();

            const categories = [
                { label: 'Miembro', value: 'member', description: 'Logs relacionados con miembros' },
                { label: 'Mensajes', value: 'message', description: 'Logs de mensajes' },
                { label: 'Roles', value: 'role', description: 'Logs relacionados con roles' },
                { label: 'Canales', value: 'channel', description: 'Logs de canales' },
                { label: 'Moderación', value: 'mod', description: 'Logs de moderación' },
            ];

            const showMainMenu = async () => {
                const selectMenu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('log_category')
                        .setPlaceholder('Selecciona una categoría de logs')
                        .addOptions(categories)
                );

                const categoryEmbed = new EmbedBuilder()
                    .setTitle('Configuración de Logs - Categorías')
                    .setDescription('Selecciona una categoría para configurar los logs correspondientes.')
                    .setColor('#ff0000');

                await sentMessage.edit({
                    embeds: [categoryEmbed],
                    components: [selectMenu],
                });
            };

            const sentMessage = await message.channel.send({
                embeds: [new EmbedBuilder().setTitle('Configuración de Logs').setDescription('Cargando menú...').setColor('#ff0000')],
            });

            await showMainMenu();

            const collector = message.channel.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60000,
            });

            collector.on('collect', async (interaction) => {
                try {
                    if (interaction.user.id !== message.author.id) {
                        return interaction.reply({ content: 'No puedes interactuar con este setup.', ephemeral: true });
                    }

                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.deferUpdate();
                    }

                    const selectedCategory = interaction.values[0];
                    const categoryConfig = getCategoryConfig(selectedCategory);

                    if (!categoryConfig) {
                        return interaction.followUp({ content: 'Categoría inválida.', ephemeral: true });
                    }

                    const logEmbed = new EmbedBuilder()
                        .setTitle(categoryConfig.title)
                        .setDescription('Selecciona qué logs deseas activar/desactivar.')
                        .setColor('#ff0000');

                    const buttons = createButtons(categoryConfig.logTypes, logSettings);
                    const rows = splitComponentsIntoRows(buttons);

                    rows.push(
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('back_to_menu')
                                .setLabel('Regresar al Menú')
                                .setStyle(ButtonStyle.Secondary)
                        )
                    );

                    await sentMessage.edit({ embeds: [logEmbed], components: rows });

                    const buttonCollector = message.channel.createMessageComponentCollector({
                        componentType: ComponentType.Button,
                        time: 60000,
                    });

                    buttonCollector.on('collect', async (buttonInteraction) => {
                        try {
                            if (buttonInteraction.user.id !== message.author.id) {
                                return buttonInteraction.reply({ content: 'No puedes interactuar con este setup.', ephemeral: true });
                            }
                    
                            try {
                                if (!buttonInteraction.deferred && !buttonInteraction.replied) {
                                    await buttonInteraction.deferUpdate();
                                }
                            } catch (error) {
                                // Silenciar cualquier error aquí
                            }
                    
                            if (buttonInteraction.customId === 'back_to_menu') {
                                await showMainMenu();
                                return;
                            }
                    
                            const logType = buttonInteraction.customId.split('_')[0];
                            const logEnabledKey = `${logType}Enabled`;
                            const logChannelKey = `${logType}ChannelId`;
                    
                            if (!logSettings[logEnabledKey]) {
                                const followUpMessage = await buttonInteraction.followUp({
                                    content: `Por favor, escribe el ID del canal donde deseas recibir los logs de ${logType}.`,
                                    ephemeral: false,
                                });
                    
                                const filter = (response) => response.author.id === message.author.id;
                                const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000 }).catch(() => null);
                    
                                const channelId = collected?.first()?.content;
                                const channel = message.guild.channels.cache.get(channelId);
                    
                                if (!channel || channel.type !== 0) {
                                    const errorMessage = await buttonInteraction.followUp({ content: 'ID de canal inválido. Asegúrate de ingresar un canal de texto válido.', ephemeral: false });
                                    await followUpMessage.delete();
                                    setTimeout(() => errorMessage.delete(), 5000);
                                    return;
                                }
                    
                                logSettings[logChannelKey] = channelId;
                                logSettings[logEnabledKey] = true;
                                await logSettings.save();
                    
                                const successMessage = await buttonInteraction.followUp({
                                    content: `Los logs de ${logType} ahora se enviarán a ${channel.toString()}.`,
                                    ephemeral: false,
                                });
                    
                                await collected.first()?.delete();
                                await followUpMessage.delete();
                    
                                setTimeout(() => successMessage.delete(), 5000);
                            } else {
                                logSettings[logEnabledKey] = false;
                                logSettings[logChannelKey] = null;
                                await logSettings.save();
                    
                                const disableMessage = await buttonInteraction.followUp({
                                    content: `El log de ${logType} ha sido desactivado.`,
                                    ephemeral: false,
                                });
                    
                                setTimeout(() => disableMessage.delete(), 5000);
                            }
                    
                            const updatedButtons = createButtons(categoryConfig.logTypes, logSettings);
                            const updatedRows = splitComponentsIntoRows(updatedButtons);
                    
                            updatedRows.push(
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('back_to_menu')
                                        .setLabel('Regresar al Menú')
                                        .setStyle(ButtonStyle.Secondary)
                                )
                            );
                    
                            await sentMessage.edit({ components: updatedRows });
                        } catch (error) {
                            // Silenciar todos los errores
                        }
                    });

                    buttonCollector.on('end', () => disableComponents(sentMessage));
                } catch (error) {
                    console.error('Error al manejar selección:', error);
                }
            });

            collector.on('end', () => disableComponents(sentMessage));
        } catch (error) {
            console.error('Error general en setuplogs:', error);
            message.channel.send('Hubo un problema al configurar los logs. Por favor, inténtalo nuevamente.');
        }
    },
};

function splitComponentsIntoRows(components, maxPerRow = 5) {
    const rows = [];
    for (let i = 0; i < components.length; i += maxPerRow) {
        rows.push(new ActionRowBuilder().addComponents(components.slice(i, i + maxPerRow)));
    }
    return rows;
}

function disableComponents(message) {
    try {
        const disabledComponents = message.components.map((row) => {
            return new ActionRowBuilder().addComponents(
                row.components.map((component) => component.setDisabled ? component.setDisabled(true) : component)
            );
        });
        message.edit({ components: disabledComponents });
    } catch (error) {
        console.error('Error al desactivar componentes:', error);
    }
}

function getCategoryConfig(category) {
    const config = {
        member: { logTypes: ['memberJoin', 'memberLeave'], title: 'Configuración de Logs - Miembros' },
        message: { logTypes: ['messageDelete', 'messageUpdate'], title: 'Configuración de Logs - Mensajes' },
        role: { logTypes: ['roleCreate', 'roleDelete', 'roleUpdate'], title: 'Configuración de Logs - Roles' },
        channel: { logTypes: ['channelCreate', 'channelDelete', 'channelEdit'], title: 'Configuración de Logs - Canales' },
        mod: { logTypes: ['userBan', 'userTimeout'], title: 'Configuración de Logs - Moderación' },
    };
    return config[category] || null;
}

function createButtons(logTypes, logSettings) {
    return logTypes.map((logType) => {
        const isEnabled = logSettings[`${logType}Enabled`];
        return new ButtonBuilder()
            .setCustomId(`${logType}_toggle`)
            .setLabel(isEnabled ? `${logType} (Activado)` : `${logType} (Desactivado)`)
            .setStyle(isEnabled ? ButtonStyle.Success : ButtonStyle.Danger);
    });
}
