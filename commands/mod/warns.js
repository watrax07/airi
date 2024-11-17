const Warning = require('../../Schemas/warning');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const GuildSetup = require('../../Schemas/guildSetup');
const messages = require('./messages/warns'); // Asegúrate de importar el archivo de mensajes

module.exports = {
    name: 'warns',
    description: 'Muestra todas las advertencias de un miembro del servidor.',
    owner: false,
    category: 'Admin',
    async execute(message, args) {
        const guildId = message.guild.id;

        // Validar si el servidor está configurado
        const guild = await GuildSetup.findOne({ guildId: guildId });

        if (!guild || !guild.isSetupComplete) {
            const lang = guild ? guild.language : 'es';
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].setupRequired}**`);
            return message.channel.send({ embeds: [embed] });
        }

        const lang = guild.language;

        // Validar permisos
        if (!message.member.permissions.has('ModerateMembers')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].noPermissions}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Validar que se mencione a un usuario o se proporcione su ID
        const user = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
        if (!user || !user.user) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].mentionUser}**`);
            return message.channel.send({ embeds: [embed] });
        }

        try {
            const warnings = await Warning.find({ GuildId: guildId, UserId: user.id });

            if (warnings.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#f3b0ff')
                    .setDescription(`**${messages[lang].noWarnings.replace('{user}', user.user.tag)}**`);
                return message.channel.send({ embeds: [embed] });
            }

            // Configuración inicial de la paginación
            let currentPage = 0;
            const warningsPerPage = 3;
            const totalPages = Math.ceil(warnings.length / warningsPerPage);

            const createEmbed = (page) => {
                const embed = new EmbedBuilder()
                    .setColor('#f3b0ff')
                    .setTitle('<:hi:1307446284226924605>' + messages[lang].title.replace('{user}', user.user.tag))
                    .setDescription(messages[lang].description)
                    .setFooter({ text: `${messages[lang].page} ${page + 1}/${totalPages}` });

                const start = page * warningsPerPage;
                const end = start + warningsPerPage;

                warnings.slice(start, end).forEach((warn, index) => {
                    embed.addFields({
                        name: `<a:arrow:1307446437461884969> ${messages[lang].warning} #${start + index + 1}`,
                        value: `${messages[lang].reason}: **${warn.Reason}**\n${messages[lang].date}: <t:${Math.floor(
                            new Date(warn.Date).getTime() / 1000
                        )}:F>`,
                    });
                });

                return embed;
            };

            const embed = createEmbed(currentPage);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('left')
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('right')
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === totalPages - 1)
            );

            const messageEmbed = await message.channel.send({ embeds: [embed], components: [row] });

            // Crear un collector para manejar los clics de los botones
            const collector = messageEmbed.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async (interaction) => {
                if (interaction.user.id !== message.author.id) {
                    return interaction.reply({
                        content: messages[lang].notYourInteraction,
                        ephemeral: true,
                    });
                }

                if (interaction.customId === 'left' && currentPage > 0) {
                    currentPage--;
                } else if (interaction.customId === 'right' && currentPage < totalPages - 1) {
                    currentPage++;
                }

                const newEmbed = createEmbed(currentPage);
                const newRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('left')
                        .setLabel('◀️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('right')
                        .setLabel('▶️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === totalPages - 1)
                );

                await interaction.update({ embeds: [newEmbed], components: [newRow] });
            });

            collector.on('end', () => {
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('left')
                        .setLabel('◀️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('right')
                        .setLabel('▶️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );

                messageEmbed.edit({ components: [disabledRow] });
            });
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].fetchError}**`);
            return message.channel.send({ embeds: [embed] });
        }
    },
};
