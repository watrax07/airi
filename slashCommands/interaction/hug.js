const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const kakashi = require('anime-actions');
const Hug = require('../../Schemas/interactions/hug');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Abraza a alguien.')
        .setIntegrationTypes(1)
        .setContexts(0, 1, 2)
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario que quieres abrazar.')
                .setRequired(false)
        ),

        async execute(interaction) {
            try {
                // Responder inmediatamente con deferReply()
                await interaction.deferReply();
    
                const user = interaction.options.getUser('usuario') || interaction.user;
    
                // Buscar o crear el registro de abrazos del usuario en la base de datos
                let hugRecord = await Hug.findOne({ userId: user.id });
                if (!hugRecord) {
                    hugRecord = new Hug({
                        userId: user.id,
                        hugsCount: 1
                    });
                } else {
                    hugRecord.hugsCount += 1;
                }
    
                // Guardar el registro actualizado en la base de datos
                await hugRecord.save();
    
                // Crear el embed con la respuesta
                const mbed = new EmbedBuilder()
                    .setColor('#f3b0ff')
                    .setTitle(`¡${interaction.user.username} ha abrazado a ${user.username}!`)
                    .setImage(await kakashi.hug()) // Obtener la imagen del abrazo
                    .setFooter({ text: `Total de abrazos: ${hugRecord.hugsCount}` })
                    .setTimestamp();
    
                await interaction.editReply({ embeds: [mbed] });
            } catch (error) {
            }
        },
    };