const { EmbedBuilder, time } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');

module.exports = {
    name: 'guildMemberRemove',
    async execute(client, member) {

        // Verificamos si el miembro pertenece a un servidor
        if (!member.guild) {
            return;
        }

        // Buscamos la configuración de logs para este servidor
        const logSettings = await LogSettings.findOne({ guildId: member.guild.id });
        if (!logSettings) {
            return;
        }

        // Comprobamos si los logs de salida de miembros están habilitados y si se ha configurado un canal para estos logs
        if (logSettings.memberLeaveEnabled && logSettings.memberLeaveChannelId) {
            const logChannel = member.guild.channels.cache.get(logSettings.memberLeaveChannelId);
            if (!logChannel) {
                return;
            }

            const nombre = member.user.tag
            const userID = member.user.id
            const date = new Date(member.joinedTimestamp);
            const Time = time(date)

            // Creamos un embed para mostrar el detalle del miembro que salió
            const embed = new EmbedBuilder()
                .setColor('#FF0000') // Rojo, para indicar que el miembro se ha ido
                .setTitle('🔴 Miembro Salió')
                .setDescription(`**${member.user.tag}** ha abandonado el servidor.`)
                .addFields(
                    { name: `Usuario que ha salido:`, value: `\`\`\`${nombre}\`\`\`` || `\`\`\`Contenido no visible\`\`\`` },
                    { name: `ID del usuario`,  value: `\`\`\`${userID}\`\`\`` || `\`\`\`Contenido no visible\`\`\``},
                    { name: 'Miembro desde', value: Time, inline: true },
                    { name: 'Miembros Totales', value: `${member.guild.memberCount}`, inline: true }
                )
                .setTimestamp();

            // Enviamos el embed al canal de logs
            logChannel.send({ embeds: [embed] });
        }
    },
};

// mia
