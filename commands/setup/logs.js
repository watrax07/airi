const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, StringSelectMenuBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup');

module.exports = {
    name: 'setuplogs',
    description: 'Configura los logs del servidor',
    async execute(message) {
        const guildId = message.guild.id;

        // Verificar si el servidor está configurado
        const guild = await GuildSetup.findOne({ guildId });
        if (!guild || !guild.isSetupComplete) {
            return message.channel.send('Por favor, completa la configuración del servidor antes de configurar los logs.');
        }

        // Obtener o crear configuración de logs
        let logSettings = await LogSettings.findOne({ guildId });
        if (!logSettings) {
            logSettings = new LogSettings({ guildId });
            await logSettings.save();
        }

        const categories = [
            { label: 'Miembro', value: 'member', description: 'Logs relacionados con miembros (entradas/salidas)' },
            { label: 'Mensajes', value: 'message', description: 'Logs de mensajes (envío, edición, eliminación)' },
            { label: 'Roles', value: 'role', description: 'Logs relacionados con roles (asignación/eliminación)' },
            { label: 'Canales', value: 'channel', description: 'Logs relacionados con la creación y eliminación de canales' },
            { label: 'Moderación', value: 'mod', description: 'Logs de acciones de moderación' },
        ];

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

        const sentMessage = await message.channel.send({
            embeds: [categoryEmbed],
            components: [selectMenu]
        });

        const collector = message.channel.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60000
        });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: 'No puedes interactuar con este setup.', ephemeral: true });
            }

            const selectedCategory = interaction.values[0];
            let logTypes, embedTitle;

            switch (selectedCategory) {
                case 'member':
                    logTypes = ['memberJoin', 'memberLeave'];
                    embedTitle = 'Configuración de Logs - Miembros';
                    break;
                case 'message':
                    logTypes = ['messageDelete', 'messageUpdate', 'messageSend'];
                    embedTitle = 'Configuración de Logs - Mensajes';
                    break;
                case 'role':
                    logTypes = ['roleCreate', 'roleDelete', 'roleUpdate'];
                    embedTitle = 'Configuración de Logs - Roles';
                    break;
                case 'channel':
                    logTypes = ['channelCreate', 'channelDelete', 'channelEdit'];
                    embedTitle = 'Configuración de Logs - Canales';
                    break;
                case 'mod':
                    logTypes = ['userBan', 'userKick', 'userWarn', 'userUnwarn', 'userTimeout'];
                    embedTitle = 'Configuración de Logs - Moderación';
                    break;
            }

            // Función para crear botones basados en el estado actual de cada log
            const createButtons = () => {
                return logTypes.map(logType => {
                    const isEnabled = logSettings[`${logType}Enabled`]; // Verificamos el estado de habilitación
                    return new ButtonBuilder()
                        .setCustomId(`${logType}_toggle`)
                        .setLabel(isEnabled ? `${logType} (Activado)` : `${logType} (Desactivado)`)
                        .setStyle(isEnabled ? ButtonStyle.Success : ButtonStyle.Danger);
                });
            };

            const logEmbed = new EmbedBuilder()
                .setTitle(embedTitle)
                .setDescription('Selecciona qué logs deseas activar/desactivar.')
                .setColor('#ff0000');

            let logRow = new ActionRowBuilder().addComponents(createButtons());

            // Actualizar el mensaje con el estado inicial de los botones
            await interaction.update({ embeds: [logEmbed], components: [logRow] });

            const buttonCollector = interaction.channel.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60000
            });

            buttonCollector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.user.id !== message.author.id) {
                    return buttonInteraction.reply({ content: 'No puedes interactuar con este setup.', ephemeral: true });
                }
            
                const logType = buttonInteraction.customId.split('_')[0];
                const logChannelKey = `${logType}ChannelId`;
                const logEnabledKey = `${logType}Enabled`;
            
                // Verificar si ya fue respondida
                if (!buttonInteraction.deferred && !buttonInteraction.replied) {
                    await buttonInteraction.deferUpdate();
                }
            
                // Cambiar el estado del log (activar/desactivar)
                if (logSettings[logEnabledKey]) {
                    // Desactivar el log
                    logSettings[logEnabledKey] = false;
                    logSettings[logChannelKey] = null; // Limpiar el canal asociado
                } else {
                    // Activar el log
                    logSettings[logEnabledKey] = true;
                    logSettings[logChannelKey] = 'default_channel_id'; // Temporal, luego se actualizará con el canal real
                }
            
                await logSettings.save();
            
                // Si el log está siendo activado, preguntar por el canal
                if (logSettings[logEnabledKey]) {
                    // Verificar si ya fue respondida antes de usar followUp
                    if (!buttonInteraction.replied) {
                        await buttonInteraction.followUp({ content: `Por favor, escribe el ID del canal donde quieres recibir los logs de ${logType}.`, ephemeral: true });
                    }
            
                    // Filtro para capturar solo el siguiente mensaje del autor con el ID del canal
                    const filter = response => response.author.id === message.author.id && response.content;
            
                    try {
                        // Esperar el ID del canal del usuario
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
                        const channelId = collected.first().content;
                        const channel = message.guild.channels.cache.get(channelId);
            
                        // Validar si el canal existe y es un canal de texto
                        if (!channel || channel.type !== 0) {
                            return buttonInteraction.followUp({ content: 'ID de canal inválido. Asegúrate de enviar un ID de canal válido.', ephemeral: true });
                        }
            
                        // Guardar el canal donde se enviarán los logs
                        logSettings[logChannelKey] = channelId;
                        await logSettings.save();
            
                        // Verificar si ya fue respondida antes de usar followUp
                        if (!buttonInteraction.replied) {
                            await buttonInteraction.followUp({ content: `Los logs de ${logType} ahora se enviarán a ${channel.toString()}.`, ephemeral: true });
                        }
                    } catch (error) {
                        // Verificar si ya fue respondida antes de usar followUp
                        if (!buttonInteraction.replied) {
                            await buttonInteraction.followUp({ content: 'No se recibió una respuesta a tiempo. El log no fue configurado.', ephemeral: true });
                        }
                    }
                } else {
                    // Si el log está siendo desactivado
                    if (!buttonInteraction.replied) {
                        await buttonInteraction.followUp({ content: `El log de ${logType} ha sido desactivado.`, ephemeral: true });
                    }
                }
            
                // Actualizar los botones en el mensaje original
                const updatedButtons = createButtons();
                const logRow = new ActionRowBuilder().addComponents(updatedButtons);
            
                // Editar el mensaje original con los botones actualizados
                await sentMessage.edit({ embeds: [logEmbed], components: [logRow] });
            });

            buttonCollector.on('end', async () => {
                try {
                    await sentMessage.edit({ components: [] });
                } catch (error) {
                    console.error('Error al intentar editar el mensaje:', error);
                }
            });
        });

        collector.on('end', async () => {
            try {
                await sentMessage.edit({ components: [] });
            } catch (error) {
                console.error('Error al intentar editar el mensaje:', error);
            }
        });
    },
};
