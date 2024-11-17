const GuildSetup = require('../../Schemas/guildSetup');
const Warning = require('../../Schemas/warning');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const messages = require('./messages/unwarn'); // Mensajes multilanguage

module.exports = {
    name: 'unwarn',
    description: 'Elimina una o varias advertencias de un miembro del servidor.',
    owner: false,
    category: 'Admin',
    async execute(message, args) {
        const guildId = message.guild.id;

        // Validar configuración del servidor
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

        // Validar que se mencione un usuario
        const user = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
        if (!user || !user.user) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].mentionUser}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Validar que se proporcionen advertencias
        const warnNumbers = args.slice(1).map(num => parseInt(num) - 1).filter(num => !isNaN(num) && num >= 0);
        if (warnNumbers.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].noWarnNumber}**`);
            return message.channel.send({ embeds: [embed] });
        }

        try {
            // Obtener todas las advertencias del usuario
            const warnings = await Warning.find({ GuildId: guildId, UserId: user.id });

            // Validar que las advertencias especificadas existan
            const invalidWarns = warnNumbers.filter(num => num >= warnings.length);
            if (invalidWarns.length > 0) {
                const embed = new EmbedBuilder()
                    .setColor('#f3b0ff')
                    .setDescription(
                        `<a:x_:1307446452913574071> **${messages[lang].warnNotFound
                            .replace('{user}', user.user.tag)
                            .replace('{warnNumber}', invalidWarns.map(num => num + 1).join(', '))}**`
                    );
                return message.channel.send({ embeds: [embed] });
            }

            // Seleccionar advertencias para eliminación
            const selectedWarnings = warnNumbers.map(num => warnings[num]);
            const embed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle(messages[lang].confirmTitle)
                .setDescription(
                    `${messages[lang].confirmDescription.replace('{user}', user.user.tag)}\n\n` +
                    selectedWarnings
                        .map(
                            (warn, index) =>
                                `**#${warnNumbers[index] + 1}:**\n${messages[lang].reason}: \`${warn.Reason}\`\n${messages[lang].date}: <t:${Math.floor(
                                    new Date(warn.Date).getTime() / 1000
                                )}:F>`
                        )
                        .join('\n\n')
                );

            // Botones de confirmación y cancelación
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('confirmUnwarn')
                    .setLabel(messages[lang].confirm)
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancelUnwarn')
                    .setLabel(messages[lang].cancel)
                    .setStyle(ButtonStyle.Danger)
            );

            const confirmationMessage = await message.channel.send({ embeds: [embed], components: [row] });

            // Crear un collector para manejar la confirmación
            const collector = confirmationMessage.createMessageComponentCollector({ time: 30000 });

            collector.on('collect', async (interaction) => {
                if (interaction.user.id !== message.author.id) {
                    return interaction.reply({
                        content: messages[lang].notYourInteraction,
                        ephemeral: true,
                    });
                }

                if (interaction.customId === 'confirmUnwarn') {
                    // Eliminar las advertencias seleccionadas
                    const deleteIds = selectedWarnings.map(warn => warn._id);
                    await Warning.deleteMany({ _id: { $in: deleteIds } });

                    const successEmbed = new EmbedBuilder()
                        .setColor('#f3b0ff')
                        .setDescription(
                            `<a:tick:1307446418633527406> **${messages[lang].unwarnSuccess
                                .replace('{user}', user.user.tag)
                                .replace('{warnNumbers}', warnNumbers.map(num => num + 1).join(', '))}**`
                        );
                    await interaction.update({ embeds: [successEmbed], components: [] });
                } else if (interaction.customId === 'cancelUnwarn') {
                    const cancelEmbed = new EmbedBuilder()
                        .setColor('#f3b0ff')
                        .setDescription(`<a:x_:1307446452913574071> **${messages[lang].unwarnCancelled}**`);
                    await interaction.update({ embeds: [cancelEmbed], components: [] });
                }

                collector.stop();
            });

            collector.on('end', () => {
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirmUnwarn')
                        .setLabel(messages[lang].confirm)
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('cancelUnwarn')
                        .setLabel(messages[lang].cancel)
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true)
                );

                confirmationMessage.edit({ components: [disabledRow] });
            });
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('<a:x_:1307446452913574071> ' + `**${messages[lang].unwarnError}**`);
            return message.channel.send({ embeds: [embed] });
        }
    },
};
