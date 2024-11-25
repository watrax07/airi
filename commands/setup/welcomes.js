const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} = require('discord.js');
const WelcomeSettings = require('../../Schemas/welcomeSchema');

module.exports = {
    name: 'setupwelcome',
    description: 'Configura un mensaje de bienvenida personalizado.',
    async execute(message) {
        const guildId = message.guild.id;

        // Crear o cargar configuración inicial
        let welcomeSettings = await WelcomeSettings.findOne({ guildId });
        if (!welcomeSettings) {
            welcomeSettings = new WelcomeSettings({ guildId });
            await welcomeSettings.save();
        }

        // Embed inicial con configuraciones actuales o mensaje de "Sin configuración"
        const initialEmbed = new EmbedBuilder().setColor('#00ff00');

        if (welcomeSettings) {
            initialEmbed
                .setTitle('Configuración Actual de Bienvenidas')
                .setDescription('Revisa la configuración existente o comienza una nueva.')
                .addFields(
                    { name: 'Canal', value: `<#${welcomeSettings.channelId || 'No configurado'}>` },
                    { name: 'Título', value: welcomeSettings.title || 'No configurado', inline: true },
                    { name: 'Descripción', value: welcomeSettings.description || 'No configurado', inline: true },
                    { name: 'Color', value: welcomeSettings.color || 'No configurado', inline: true },
                    { name: 'Thumbnail', value: welcomeSettings.thumbnail || 'No configurado', inline: true },
                    { name: 'Imagen', value: welcomeSettings.image || 'No configurado', inline: true },
                    { name: 'Footer', value: welcomeSettings.footer || 'No configurado', inline: true }
                );
        } else {
            initialEmbed
                .setTitle('Sin Configuración de Bienvenidas')
                .setDescription('No se encontró una configuración previa. Haz clic en el botón para comenzar.');
        }

        // Botones iniciales
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('start_welcome_config')
                .setLabel('Empezar a Configurar')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('cancel_welcome_config')
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Danger)
        );

        const setupMessage = await message.channel.send({
            embeds: [initialEmbed],
            components: [buttons],
        });

        const collector = setupMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 90000,
        });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({
                    content: 'Solo el usuario que ejecutó este comando puede interactuar con estos botones.',
                    ephemeral: true,
                });
            }

            if (interaction.customId === 'start_welcome_config') {
                const previewEmbed = createPreviewEmbed(welcomeSettings);

                // Actualizar el mensaje: eliminar el embed inicial y mostrar solo el preview
                await interaction.update({
                    embeds: [previewEmbed], // Solo mostrar el preview al iniciar la configuración
                    components: [], // Retirar los botones iniciales
                });

                // Iniciar el flujo de configuración
                await askMessageBeforeEmbed(interaction, message, welcomeSettings, previewEmbed);
            } else if (interaction.customId === 'cancel_welcome_config') {
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('Configuración Cancelada')
                            .setDescription('La configuración del mensaje de bienvenida fue cancelada.'),
                    ],
                    components: [],
                });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                setupMessage.edit({
                    components: [],
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('Tiempo Expirado')
                            .setDescription('El tiempo para configurar las bienvenidas ha expirado.'),
                    ],
                }).catch(() => {});
            }
        });
    },
};

// Función para reemplazar placeholders
function replacePlaceholders(template, member) {
    return template
        .replace('{user}', `<@${member.id}>`)
        .replace('{usertag}', member.user.tag)
        .replace('{membercount}', member.guild.memberCount);
}

// Función para crear un embed de previsualización
function createPreviewEmbed(welcomeSettings) {
    const fakeMember = {
        id: '123456789012345678',
        user: { tag: 'Usuario#1234' },
        guild: { memberCount: 42 },
    };

    const embed = new EmbedBuilder()
        .setColor(welcomeSettings.color || '#00ff00')
        .setTitle(replacePlaceholders(welcomeSettings.title || 'Bienvenido', fakeMember));

    if (welcomeSettings.description && welcomeSettings.description.trim().length > 0) {
        embed.setDescription(replacePlaceholders(welcomeSettings.description, fakeMember));
    }

    if (welcomeSettings.thumbnail && isValidURL(welcomeSettings.thumbnail)) {
        embed.setThumbnail(welcomeSettings.thumbnail);
    }

    if (welcomeSettings.image && isValidURL(welcomeSettings.image)) {
        embed.setImage(welcomeSettings.image);
    }

    if (welcomeSettings.footer && welcomeSettings.footer.trim().length > 0) {
        embed.setFooter({ text: replacePlaceholders(welcomeSettings.footer, fakeMember) });
    }

    return embed;
}

// Función para preguntar si se desea agregar un mensaje antes del embed
async function askMessageBeforeEmbed(interaction, message, welcomeSettings, previewEmbed) {
    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('add_message_before')
            .setLabel('Sí')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('skip_message_before')
            .setLabel('No')
            .setStyle(ButtonStyle.Danger)
    );

    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Mensaje antes del Embed')
                .setDescription('¿Quieres agregar un mensaje antes del embed de bienvenida?'),
        ],
        components: [buttons],
    });

    const collector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 90000,
    });

    collector.on('collect', async (btnInteraction) => {
        if (btnInteraction.user.id !== message.author.id) {
            return btnInteraction.reply({
                content: 'Solo el usuario que ejecutó este comando puede interactuar con estos botones.',
                ephemeral: true,
            });
        }

        if (btnInteraction.customId === 'add_message_before') {
            await btnInteraction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('Texto para el Mensaje')
                        .setDescription('Escribe el mensaje que deseas enviar antes del embed.'),
                ],
                components: [],
            });

            const filter = (response) => response.author.id === message.author.id;
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 90000 }).catch(() => null);

            if (!collected || !collected.first()) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('Error')
                            .setDescription('No respondiste a tiempo. Configuración cancelada.'),
                    ],
                    components: [],
                });
                return;
            }

            const response = collected.first();
            const value = response.content.trim();

            welcomeSettings.welcomeMessage = value || null; // Guardar el mensaje adicional
            await welcomeSettings.save();
            await response.delete();

            await configureWelcomeMessage(interaction, message, welcomeSettings, previewEmbed);
        } else if (btnInteraction.customId === 'skip_message_before') {
            welcomeSettings.welcomeMessage = null; // No agregar mensaje antes del embed
            await welcomeSettings.save();
            await btnInteraction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('Sin Mensaje Antes del Embed')
                        .setDescription('No se agregará ningún mensaje antes del embed.'),
                ],
                components: [],
            });

            await configureWelcomeMessage(interaction, message, welcomeSettings, previewEmbed);
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            interaction.editReply({
                components: [],
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('Tiempo Expirado')
                        .setDescription('No respondiste a tiempo. Configuración cancelada.'),
                ],
            }).catch(() => {});
        }
    });
}

async function configureWelcomeMessage(interaction, message, welcomeSettings, previewEmbed) {
    const steps = [
        { question: '¿Qué título quieres para tu embed?', key: 'title', type: 'text' },
        { question: '¿Qué descripción quieres para tu embed? Puedes usar {user}, {usertag}, y {membercount}.', key: 'description', type: 'text' },
        { question: '¿Qué color quieres para tu embed? (Formato hexadecimal, ej. #ff0000)', key: 'color', type: 'text' },
        { question: '¿Quieres agregar un thumbnail? Proporciona el enlace (URL).', key: 'thumbnail', type: 'url' },
        { question: '¿Quieres agregar una imagen? Proporciona el enlace (URL).', key: 'image', type: 'url' },
        { question: '¿Qué texto quieres en el footer? Puedes usar {user}, {usertag}, y {membercount}.', key: 'footer', type: 'text' },
        {
            question: 'Proporciona el ID o mención del canal donde se enviarán las bienvenidas.',
            key: 'channelId',
            type: 'channel', // Este paso no permite skip
        },
    ];

    async function askQuestion(index) {
        if (index >= steps.length) {
            await finalizeWelcomeConfig(interaction, welcomeSettings, message);
            return;
        }

        const currentStep = steps[index];
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Configuración de Bienvenidas')
            .setDescription(currentStep.question)
            .setFooter({ text: 'Escribe tu respuesta en el chat o usa "skip" para dejarlo en blanco (excepto para el canal).' });

        // Mostrar el embed de previsualización y la nueva pregunta
        await interaction.editReply({ embeds: [previewEmbed, embed] });

        const filter = (response) => response.author.id === message.author.id;
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 90000 }).catch(() => null);

        if (!collected || !collected.first()) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('Error')
                        .setDescription('No respondiste a tiempo. Configuración cancelada.'),
                ],
            });
            return;
        }

        const response = collected.first();
        const value = response.content.trim();

        // Validaciones para el canal (obligatorio)
        if (currentStep.key === 'channelId') {
            // Extraer ID del canal
            let channelId = value.match(/^<#(\d+)>$/)?.[1] || value.match(/^#(\w+)$/)?.[1] || value;
        
            // Buscar el canal en el servidor
            const channel = message.guild.channels.cache.get(channelId);
        
            if (!channel) {
                await message.channel.send('Proporciona un canal válido en uno de los siguientes formatos:\n- `#canal`\n- `<#idcanal>`\n- `idcanal`.')
                    .then((msg) => setTimeout(() => msg.delete(), 5000));
                await askQuestion(index);
                return;
            }
        
            welcomeSettings[currentStep.key] = channel.id; // Guardar el ID del canal
        } else {
            if (value.toLowerCase() === 'skip') {
                welcomeSettings[currentStep.key] = ''; // Guardar como vacío si el usuario salta el paso
            } else {
                if (currentStep.type === 'url' && !isValidURL(value)) {
                    await message.channel.send('Proporciona una URL válida.').then((msg) => setTimeout(() => msg.delete(), 5000));
                    await askQuestion(index);
                    return;
                }
        
                if (currentStep.key === 'color' && !/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
                    await message.channel.send('Proporciona un color válido en formato hexadecimal (ej. #ff0000).')
                        .then((msg) => setTimeout(() => msg.delete(), 5000));
                    await askQuestion(index);
                    return;
                }
        
                welcomeSettings[currentStep.key] = value || ''; // Guardar el valor proporcionado
            }
        }        

        await response.delete();
        updatePreviewEmbed(previewEmbed, welcomeSettings);
        await askQuestion(index + 1);
    }

    await askQuestion(0);
}

function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function updatePreviewEmbed(embed, settings) {
    const fakeMember = {
        id: '123456789012345678',
        user: { tag: 'Usuario#1234' },
        guild: { memberCount: 42 },
    };

    embed.setColor(settings.color || '#00ff00')
        .setTitle(replacePlaceholders(settings.title || 'Bienvenido', fakeMember));

    if (settings.description && settings.description.trim().length > 0) {
        embed.setDescription(
            replacePlaceholders(settings.description, fakeMember)
        );
    }

    if (settings.thumbnail && isValidURL(settings.thumbnail)) {
        embed.setThumbnail(settings.thumbnail);
    } else {
        embed.setThumbnail(null);
    }

    if (settings.image && isValidURL(settings.image)) {
        embed.setImage(settings.image);
    } else {
        embed.setImage(null);
    }

    if (settings.footer && settings.footer.trim().length > 0) {
        embed.setFooter({ text: replacePlaceholders(settings.footer, fakeMember) });
    } else {
        embed.setFooter(null);
    }
}


function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function updatePreviewEmbed(embed, settings) {
    const fakeMember = {
        id: '123456789012345678',
        user: { tag: 'Usuario#1234' },
        guild: { memberCount: 42 },
    };

    embed.setColor(settings.color || '#00ff00')
        .setTitle(replacePlaceholders(settings.title || 'Bienvenido', fakeMember));

    if (settings.description && settings.description.trim().length > 0) {
        embed.setDescription(
            replacePlaceholders(settings.description, fakeMember)
        );
    }

    if (settings.thumbnail && isValidURL(settings.thumbnail)) {
        embed.setThumbnail(settings.thumbnail);
    } else {
        embed.setThumbnail(null);
    }

    if (settings.image && isValidURL(settings.image)) {
        embed.setImage(settings.image);
    } else {
        embed.setImage(null);
    }

    if (settings.footer && settings.footer.trim().length > 0) {
        embed.setFooter({ text: replacePlaceholders(settings.footer, fakeMember) });
    } else {
        embed.setFooter(null);
    }
}


function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function updatePreviewEmbed(embed, settings) {
    const fakeMember = {
        id: '123456789012345678',
        user: { tag: 'Usuario#1234' },
        guild: { memberCount: 42 },
    };

    embed.setColor(settings.color || '#00ff00')
        .setTitle(replacePlaceholders(settings.title || 'Bienvenido', fakeMember));

    if (settings.description && settings.description.trim().length > 0) {
        embed.setDescription(
            replacePlaceholders(settings.description, fakeMember)
        );
    }

    if (settings.thumbnail && isValidURL(settings.thumbnail)) {
        embed.setThumbnail(settings.thumbnail);
    } else {
        embed.setThumbnail(null);
    }

    if (settings.image && isValidURL(settings.image)) {
        embed.setImage(settings.image);
    } else {
        embed.setImage(null);
    }

    if (settings.footer && settings.footer.trim().length > 0) {
        embed.setFooter({ text: replacePlaceholders(settings.footer, fakeMember) });
    } else {
        embed.setFooter(null);
    }
}


function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function updatePreviewEmbed(embed, settings) {
    const fakeMember = {
        id: '123456789012345678',
        user: { tag: 'Usuario#1234' },
        guild: { memberCount: 42 },
    };

    embed.setColor(settings.color || '#00ff00')
        .setTitle(replacePlaceholders(settings.title || 'Bienvenido', fakeMember));

    if (settings.description && settings.description.trim().length > 0) {
        embed.setDescription(
            replacePlaceholders(settings.description, fakeMember)
        );
    }

    if (settings.thumbnail && isValidURL(settings.thumbnail)) {
        embed.setThumbnail(settings.thumbnail);
    } else {
        embed.setThumbnail(null);
    }

    if (settings.image && isValidURL(settings.image)) {
        embed.setImage(settings.image);
    } else {
        embed.setImage(null);
    }

    if (settings.footer && settings.footer.trim().length > 0) {
        embed.setFooter({ text: replacePlaceholders(settings.footer, fakeMember) });
    } else {
        embed.setFooter(null);
    }
}

async function finalizeWelcomeConfig(interaction, welcomeSettings, message) {
    welcomeSettings.enabled = true;
    await welcomeSettings.save();

    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('¡Configuración Completada!')
                .setDescription('El mensaje de bienvenida fue configurado correctamente y está activo.'),
            createPreviewEmbed(welcomeSettings),
        ],
        components: [],
    });
}
