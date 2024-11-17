const { EmbedBuilder } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');

module.exports = {
    name: 'guildMemberAdd',
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

        // Comprobamos si los logs de ingreso de miembros están habilitados y si se ha configurado un canal para estos logs
        if (logSettings.memberJoinEnabled && logSettings.memberJoinChannelId) {
            const logChannel = member.guild.channels.cache.get(logSettings.memberJoinChannelId);
            if (!logChannel) {
                return;
            }

            // Creamos un embed para mostrar el detalle del nuevo miembro que ingresó
            const embed = new EmbedBuilder()
                .setColor('#00FF00') // Verde, para indicar que el miembro se ha unido correctamente
                .setTitle('🟢 Nuevo Miembro')
                .setDescription(`¡Bienvenido **${member.user.tag}** al servidor!`)
                .addFields(
                    { name: 'Miembro desde', value: new Date().toLocaleString(), inline: true },
                    { name: 'Miembros Totales', value: `${member.guild.memberCount}`, inline: true }
                )
                .setTimestamp();

            // Enviamos el embed al canal de logs
            logChannel.send({ embeds: [embed] });
        }
    },
};
