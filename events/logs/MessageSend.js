const mongoose = require('mongoose');
const { EmbedBuilder } = require('discord.js');
const LogSchema = require('../../Schemas/LogSchema');

module.exports = {
    name: 'messageCreate', 
    once: false,
    async execute(client, message) {
        try {
            const botMember = message.guild.members.me;
            if (!botMember.permissions.has('VIEW_CHANNEL') || !botMember.permissions.has('READ_MESSAGE_HISTORY')) {
                return;
            }

            if (message.partial) {
                await message.fetch();
            }

            if (!message.author) {
                return;
            }

            if (message.author.bot) {
                return;
            }

            // Obtenemos la configuración de logs desde la base de datos
            const logSettings = await LogSchema.findOne({ guildId: message.guild.id });
            if (!logSettings || !logSettings.messagesend) {
                return; // Si no hay logs configurados para mensajes enviados, salimos
            }

            const logChannel = message.guild.channels.cache.get(logSettings.messagesend);
            if (!logChannel) {
                return; // Si no se encuentra el canal de log, salimos
            }

            const embed = new EmbedBuilder()
                .setTitle('Mensaje Enviado')
                .setColor('#00ff00') // Color verde para mensajes enviados
                .setDescription(`Un mensaje fue enviado en el canal ${message.channel}`)
                .addFields(
                    { name: 'Autor', value: message.author ? message.author.tag : 'Desconocido', inline: true },
                    { name: 'Contenido', value: message.content || 'Sin contenido', inline: true },
                )
                .setFooter({ text: `ID del Mensaje: ${message.id}` })
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Ocurrió un error durante la ejecución del evento messageCreate:', error);
        }
    },
};
