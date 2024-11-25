const { EmbedBuilder, time, AuditLogEvent } = require('discord.js');
const LogSettings = require('../../Schemas/LogSchema');
const GuildSetup = require('../../Schemas/guildSetup'); // Importar GuildSetup
const messages = require('./messages/guildMemberRemove'); // Importar mensajes

module.exports = {
    name: 'guildMemberRemove',
    async execute(client, member) {
        if (!member.guild) return;

        // Obtener configuración del servidor
        const guildSetup = await GuildSetup.findOne({ guildId: member.guild.id });
        if (!guildSetup || !guildSetup.isSetupComplete) return;

        const lang = guildSetup.language || 'en'; // Determinar idioma del servidor

        // Obtener configuración de logs
        const logSettings = await LogSettings.findOne({ guildId: member.guild.id });
        if (!logSettings || !logSettings.memberLeaveEnabled || !logSettings.memberLeaveChannelId) return;

        const logChannel = member.guild.channels.cache.get(logSettings.memberLeaveChannelId);
        if (!logChannel) return;

        let isBan = false; // Variable para rastrear si fue un baneo reciente
        try {
            const auditLogs = await member.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberBanAdd,
                limit: 1,
            });

            const banLog = auditLogs.entries.find(entry => entry.target.id === member.user.id);

            if (banLog) {
                const timeSinceBan = Date.now() - banLog.createdTimestamp;

                // Verificamos si el baneo fue en los últimos 10 segundos
                if (timeSinceBan < 10000) {
                    isBan = true;
                    console.log(messages[lang].bannedRecently.replace('{userTag}', member.user.tag));
                    return; // No enviamos el embed si fue un baneo reciente
                }
            }
        } catch (error) {
            console.error('Error al obtener registros de auditoría:', error);
        }

        // Si no fue un baneo reciente, procedemos a registrar la salida
        if (!isBan) {
            const userTag = member.user.tag || messages[lang].unknown;
            const userId = member.user.id || messages[lang].unknown;
            const memberSince = member.joinedTimestamp
                ? time(new Date(member.joinedTimestamp))
                : messages[lang].noJoinDate;
            const totalMembers = member.guild.memberCount;

            // Crear embed multilenguaje
            const embed = new EmbedBuilder()
                .setColor('#FF0000') // Rojo, para indicar que el miembro se ha ido
                .setTitle(messages[lang].title)
                .setDescription(messages[lang].description.replace('{userTag}', userTag))
                .addFields(
                    { name: messages[lang].userLeft, value: `\`\`\`${userTag}\`\`\`` },
                    { name: messages[lang].userId, value: `\`\`\`${userId}\`\`\`` },
                    { name: messages[lang].memberSince, value: memberSince, inline: true },
                    { name: messages[lang].totalMembers, value: `${totalMembers}`, inline: true }
                )
                .setTimestamp();

            // Enviar embed al canal configurado
            await logChannel.send({ embeds: [embed] });
        }
    },
};
