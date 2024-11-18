const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, StringSelectMenuBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup');
const messages = require('./messages/setuplogs');

// Mapa global para rastrear menús activos
const activeMenus = new Map();

module.exports = {
    name: 'setuplogs',
    description: 'Configura los logs del servidor',
    owner: false,
    category: 'setup',
    async execute(message) {
        try {
            const guildId = message.guild.id;
            const guild = await GuildSetup.findOne({ guildId });

            // Determinar idioma del servidor
            const lang = guild?.language || 'en';

            if (!guild || !guild.isSetupComplete) {
                return message.channel.send(messages[lang].setupRequired);
            }

            let logSettings = await LogSettings.findOne({ guildId }) || new LogSettings({ guildId });
            if (!logSettings._id) await logSettings.save();

            const categories = [
                {
                    label: messages[lang].categories.member.label,
                    value: 'member',
                    description: messages[lang].categories.member.description,
                },
                {
                    label: messages[lang].categories.message.label,
                    value: 'message',
                    description: messages[lang].categories.message.description,
                },
                {
                    label: messages[lang].categories.role.label,
                    value: 'role',
                    description: messages[lang].categories.role.description,
                },
                {
                    label: messages[lang].categories.channel.label,
                    value: 'channel',
                    description: messages[lang].categories.channel.description,
                },
                {
                    label: messages[lang].categories.mod.label,
                    value: 'mod',
                    description: messages[lang].categories.mod.description,
                },
            ];

            const channelId = message.channel.id;

            // Desactivar cualquier menú activo en este canal
            const activeMenu = activeMenus.get(channelId);
            if (activeMenu) {
                try {
                    await activeMenu.message.edit({
                        components: disableComponents(activeMenu.message.components),
                    });
                    activeMenu.collector.stop(); // Detener colector anterior
                } catch (error) {
                    console.error('Error desactivando menú activo:', error);
                }
            }

            const showMainMenu = async () => {
                const selectMenu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`log_category_${Date.now()}`) // Custom ID único
                        .setPlaceholder(messages[lang].selectPlaceholder)
                        .addOptions(categories)
                );

                const categoryEmbed = new EmbedBuilder()
                    .setTitle(messages[lang].mainMenu.title)
                    .setDescription(messages[lang].mainMenu.description)
                    .setColor('#ff0000');

                await sentMessage.edit({
                    embeds: [categoryEmbed],
                    components: [selectMenu],
                });
            };

            const sentMessage = await message.channel.send({
                embeds: [new EmbedBuilder().setTitle(messages[lang].loading.title).setDescription(messages[lang].loading.description).setColor('#ff0000')],
            });

            await showMainMenu();

            const collector = message.channel.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60000,
            });

            // Registrar colector y mensaje en el mapa global
            activeMenus.set(channelId, { message: sentMessage, collector });

            collector.on('collect', async (interaction) => {
                try {
                    if (interaction.user.id !== message.author.id) {
                        return interaction.reply({ content: messages[lang].noPermissionInteraction, ephemeral: true });
                    }

                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.deferUpdate();
                    }

                    const selectedCategory = interaction.values[0];
                    const categoryConfig = getCategoryConfig(selectedCategory, lang);

                    if (!categoryConfig) {
                        return interaction.followUp({ content: messages[lang].invalidCategory, ephemeral: true });
                    }

                    const logEmbed = new EmbedBuilder()
                        .setTitle(categoryConfig.title)
                        .setDescription(messages[lang].selectLogType)
                        .setColor('#ff0000');

                    const buttons = createButtons(categoryConfig.logTypes, logSettings, lang);
                    const rows = splitComponentsIntoRows(buttons);

                    rows.push(
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`back_to_menu_${Date.now()}`)
                                .setLabel(messages[lang].backToMenu)
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
                                return buttonInteraction.reply({ content: messages[lang].noPermissionInteraction, ephemeral: true });
                            }

                            if (!buttonInteraction.deferred && !buttonInteraction.replied) {
                                await buttonInteraction.deferUpdate();
                            }

                            if (buttonInteraction.customId.startsWith('back_to_menu')) {
                                await showMainMenu();
                                return;
                            }

                            const logType = buttonInteraction.customId.split('_')[0];
                            const logEnabledKey = `${logType}Enabled`;
                            const logChannelKey = `${logType}ChannelId`;

                            const isEnabled = logSettings[logEnabledKey];

                            if (!isEnabled) {
                                const followUpMessage = await buttonInteraction.followUp({
                                    content: messages[lang].enterChannelId.replace('{logType}', logType),
                                    ephemeral: false,
                                });

                                const filter = (response) => response.author.id === message.author.id;
                                const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000 }).catch(() => null);

                                const channelId = collected?.first()?.content;
                                const channel = message.guild.channels.cache.get(channelId);

                                if (!channel || channel.type !== 0) {
                                    const errorMessage = await buttonInteraction.followUp({
                                        content: messages[lang].invalidChannelId,
                                        ephemeral: false,
                                    });
                                    await followUpMessage.delete();
                                    setTimeout(() => errorMessage.delete(), 5000);
                                    return;
                                }

                                logSettings[logChannelKey] = channelId;
                                logSettings[logEnabledKey] = true;
                                await logSettings.save();

                                const successMessage = await buttonInteraction.followUp({
                                    content: messages[lang].logEnabledMessage.replace('{logType}', logType).replace('{channel}', channel.toString()),
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
                                    content: messages[lang].logDisabledMessage.replace('{logType}', logType),
                                    ephemeral: false,
                                });

                                setTimeout(() => disableMessage.delete(), 5000);
                            }

                            const updatedButtons = createButtons(categoryConfig.logTypes, logSettings, lang);
                            const updatedRows = splitComponentsIntoRows(updatedButtons);

                            updatedRows.push(
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`back_to_menu_${Date.now()}`)
                                        .setLabel(messages[lang].backToMenu)
                                        .setStyle(ButtonStyle.Secondary)
                                )
                            );

                            await sentMessage.edit({ components: updatedRows });
                        } catch (error) {
                            console.error('Error al manejar interacción del botón:', error);
                        }
                    });

                    buttonCollector.on('end', () => disableComponents(sentMessage));
                } catch (error) {
                    console.error('Error al manejar selección:', error);
                }
            });

            collector.on('end', () => {
                disableComponents(sentMessage);
                activeMenus.delete(channelId); // Eliminar colector activo
            });
        } catch (error) {
            console.error('Error general en setuplogs:', error);
            message.channel.send(messages[lang].generalError);
        }
    },
};

function getCategoryConfig(category, lang) {
    const config = {
        member: { logTypes: ['memberJoin', 'memberLeave'], title: messages[lang].categories.member.title },
        message: { logTypes: ['messageDelete', 'messageUpdate'], title: messages[lang].categories.message.title },
        role: { logTypes: ['roleCreate', 'roleDelete', 'roleUpdate'], title: messages[lang].categories.role.title },
        channel: { logTypes: ['channelCreate', 'channelDelete', 'channelEdit'], title: messages[lang].categories.channel.title },
        mod: { logTypes: ['userBan', 'userTimeout'], title: messages[lang].categories.mod.title },
    };
    return config[category] || null;
}

function createButtons(logTypes, logSettings, lang) {
    return logTypes.map((logType) => {
        const isEnabled = logSettings[`${logType}Enabled`];
        return new ButtonBuilder()
            .setCustomId(`${logType}_toggle_${Date.now()}`)
            .setLabel(
                isEnabled
                    ? messages[lang].logEnabledButton.replace('{logType}', logType)
                    : messages[lang].logDisabledButton.replace('{logType}', logType)
            )
            .setStyle(isEnabled ? ButtonStyle.Success : ButtonStyle.Danger);
    });
}

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
                row.components.map((component) => (component.setDisabled ? component.setDisabled(true) : component))
            );
        });
        message.edit({ components: disabledComponents });
    } catch (error) {
        console.error('Error al desactivar componentes:', error);
    }
}
