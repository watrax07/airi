const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const GuildSetup = require('../../Schemas/guildSetup');
const messages = require('./messages/setup.js');

module.exports = {
    name: 'setup',
    description: 'Configura el bot para este servidor',
    async execute(message) {
        const guildId = message.guild.id;
        let guild = await GuildSetup.findOne({ guildId: guildId });

        if (!guild) {
            guild = new GuildSetup({ guildId, language: 'es' }); 
            await guild.save();
        }

        if (guild.isSetupComplete) {
            const lang = guild.language || 'es';
            if (!['es', 'en', 'fr'].includes(lang)) {
                console.error(`Código de idioma inválido: ${lang}`);
                return message.channel.send('Error: Código de idioma inválido');
            }
            return message.channel.send(messages[lang].already);
        }

        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('<:animehi:1291920678022545409> No tienes permisos para hacer eso.'); 
        }

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select-language')
                .setPlaceholder('Selecciona un idioma')
                .addOptions([
                    { label: 'Español', value: 'es', emoji: '🇪🇸' },
                    { label: 'English', value: 'en', emoji: '<:usa:1291860272784343091>' },
                    { label: 'Français', value: 'fr', emoji: '<:fr:1291860268812603565>' },
                ])
        );

        const embed = new EmbedBuilder()
            .setColor('#f3b0ff')
            .setTitle('¡Configuración del Bot! <:Animepop:1291860266975232032>')
            .setDescription('🇪🇸 Por favor, selecciona el idioma que prefieres para el bot.\n<:usa:1291860272784343091> Please select the language you prefer for the bot.\n<:fr:1291860268812603565> Veuillez sélectionner la langue que vous préférez pour le bot.');

        await message.channel.send({
            embeds: [embed],
            components: [row]
        });
    }
};