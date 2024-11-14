const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const GuildSetup = require('../../Schemas/guildSetup');
const messages = require('../../messages');
const commands = require('./slashCommands'); 

module.exports = {
    name: Events.InteractionCreate,
    async execute(client, interaction) {
        if (!interaction.guild) {
            const command = commands.get(interaction.commandName);
            if (command) {
                try {
                    await command.execute(interaction); 
                } catch (error) {
                    console.error('Error al ejecutar el comando en MD:', error);
                
                }
            }
            return;
        }
        
        const guild = await GuildSetup.findOne({ guildId: interaction.guild.id });
        if (interaction.isStringSelectMenu() && interaction.customId == 'select-language') {
            const selectedLanguage = interaction.values[0];

            if (!guild) {
                guild = new GuildSetup({
                    guildId: interaction.guild.id,
                    language: selectedLanguage,
                    isSetupComplete: false
                });
            } else {
                guild.language = selectedLanguage;
            }

            await guild.save();

            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setTitle(messages[selectedLanguage].yacasi)
                .setDescription(messages[selectedLanguage].changePrefixQuestion)
                .setFooter({ text: messages[selectedLanguage].footerChangePrefix });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('change_prefix')
                        .setLabel(messages[selectedLanguage].buttonChangePrefix) 
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('skip')
                        .setLabel(messages[selectedLanguage].buttonSkip) 
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.update({
                embeds: [embed],
                components: [row]
            });

        } else if (interaction.isButton()) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('change_prefix')
                        .setLabel(messages[guild.language].buttonChangePrefix) 
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true), 
                    new ButtonBuilder()
                        .setCustomId('skip')
                        .setLabel(messages[guild.language].buttonSkip)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true) 
                );

            if (interaction.customId === 'change_prefix') {
                const embed = new EmbedBuilder()
                    .setColor('#f3b0ff')
                    .setTitle(messages[guild.language].changePrefixTitle) 
                    .setDescription(messages[guild.language].changePrefixPrompt)
                    .setFooter({ text: messages[guild.language].changePrefixFooter });

                await interaction.update({ embeds: [embed], components: [row] });

                const collectPrefix = () => {
                    const filter = m => m.author.id === interaction.user.id;
                    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 30000 });

                    collector.on('collect', async (message) => {
                        const newPrefix = message.content;

                        if (newPrefix.length > 2 || /[^a-zA-Z\-_.!/#$%&=?¡¿]/.test(newPrefix) || message.content.includes('<') || message.content.includes(':') || /\d/.test(newPrefix)) {
                            await interaction.followUp({
                                content: messages[guild.language].prefixChangeError,
                                ephemeral: false 
                            });

                            const retryEmbed = new EmbedBuilder()
                                .setColor('#f3b0ff')
                                .setTitle(messages[guild.language].changePrefixTitle) 
                                .setDescription(messages[guild.language].changePrefixPrompt)
                                .setFooter({ text: messages[guild.language].changePrefixFooter });

                            await interaction.followUp({
                                embeds: [retryEmbed],
                                ephemeral: true 
                            });

                            collectPrefix();
                            return;
                        } else {
                            guild.prefix = newPrefix;
                            guild.isSetupComplete = true;
                            await guild.save();
                            
                            await interaction.followUp({
                                content: messages[guild.language].prefixChangeSuccess(newPrefix),
                                ephemeral: true
                            });
                        }
                    });

                    collector.on('end', collected => {
                        if (collected.size === 0) {
                            interaction.followUp({
                                content: messages[guild.language].noPrefixReceived,
                                ephemeral: true
                            });
                        }
                    });
                };

                collectPrefix();

            } else if (interaction.customId === 'skip') {
                await interaction.update({
                    content: messages[guild.language].skip,
                    components: [row],
                    embeds: [] 
                });

                if (guild) {
                    guild.isSetupComplete = true;
                    await guild.save();
                }
            }
        }
    },
};
