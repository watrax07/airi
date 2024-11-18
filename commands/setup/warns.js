const WarnAction = require('../../Schemas/warnAction'); // Modelo de acción de advertencias
const { EmbedBuilder } = require('discord.js');
const GuildSetup = require('../../Schemas/guildSetup');
const ms = require('ms'); // Librería para convertir el tiempo
const messages = require('./messages/setwarnaction'); // Archivo de mensajes multilingües

module.exports = {
    name: 'setwarnaction',
    description: 'Establece, muestra o elimina acciones automáticas basadas en el número de advertencias.',
    owner: false,
    category: 'setup',
    
    async execute(message, args) {
        const guildId = message.guild.id;
        const guild = await GuildSetup.findOne({ guildId: guildId }); // Obtener el idioma del servidor
        const lang = guild ? guild.language : 'es'; // Usar 'es' como idioma por defecto
        const prefix = await GuildSetup.findOne({ guildId: guildId }).then(g => g.prefix || '!'); // Obtener el prefijo del servidor

        // Si no se da un argumento o el argumento es "help", mostrar las opciones
        if (!args[0] || args[0].toLowerCase() === 'help') {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setTitle('<:hi:1307446284226924605>' + messages[lang].selectOption)
                .setDescription(`
                    ${messages[lang].enable} 
                    ${messages[lang].disable}
                    ${messages[lang].view} \n
                 <a:arrow:1307446437461884969>   ${messages[lang].usageExample} \n
                    \`${prefix}setwarnaction enable timeout 2:5m 3:20m\`
                `);
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar permisos
        if (!message.member.permissions.has('Administrator')) {
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:x_:1307446452913574071> ' + messages[lang].noPermissions);
            return message.channel.send({ embeds: [embed] });
        }

        // Si el argumento es "view", mostrar las configuraciones
        if (args[0]?.toLowerCase() === 'view') {
            const warnAction = await WarnAction.findOne({ GuildId: guildId });
        
            if (!warnAction || warnAction.Actions.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#f3b0ff')
                    .setDescription('<a:x_:1307446452913574071> ' + messages[lang].noActionsConfigured);
                return message.channel.send({ embeds: [embed] });
            }
        
            // Formatear las acciones configuradas
            const actionsList = warnAction.Actions.map(action => {
                if (action.Action === 'timeout') {
                    // Formatear umbrales para timeout
                    const formattedThresholds = action.Thresholds.map(th => 
                        `${th.Warns}: ${ms(th.Timeout, { long: true })}`
                    ).join('\n');
                    return `**${action.Action}**:\n${formattedThresholds}`;
                } else {
                    // Formatear umbrales para kick y ban
                    const formattedThresholds = action.Thresholds.map(th => 
                        `${th.Warns} ${messages[lang].warns}`
                    ).join('\n');
                    return `**${action.Action}**:\n${formattedThresholds}`;
                }
            }).join('\n\n');
        
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setTitle('<:hi:1307446284226924605> ' + messages[lang].currentActions)
                .setDescription(actionsList);
            return message.channel.send({ embeds: [embed] });
        }

// Si el argumento es "disable", desactivar una acción específica
if (args[0]?.toLowerCase() === 'disable') {
    const action = args[1]?.toLowerCase(); // Obtener la acción a deshabilitar (kick, ban, timeout)

    const validActions = ['timeout', 'kick', 'ban'];
    if (!validActions.includes(action)) {
        const embed = new EmbedBuilder()
            .setColor('#f3b0ff')
            .setDescription('<a:x_:1307446452913574071> ' + messages[lang].invalidActionDisable);
        return message.channel.send({ embeds: [embed] });
    }

    const warnAction = await WarnAction.findOne({ GuildId: guildId });

    if (!warnAction || warnAction.Actions.length === 0) {
        const embed = new EmbedBuilder()
            .setColor('#f3b0ff')
            .setDescription('<a:x_:1307446452913574071> ' + messages[lang].noActionsConfigured);
        return message.channel.send({ embeds: [embed] });
    }

    // Buscar y eliminar la acción específica
    const actionIndex = warnAction.Actions.findIndex(a => a.Action === action);
    if (actionIndex === -1) {
        const embed = new EmbedBuilder()
            .setColor('#f3b0ff')
            .setDescription('<a:x_:1307446452913574071> ' + messages[lang].actionNotFoundDisable.replace('{action}', action));
        return message.channel.send({ embeds: [embed] });
    }

    // Eliminar la acción específica del array
    warnAction.Actions.splice(actionIndex, 1);
    await warnAction.save();

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setDescription(messages[lang].actionDisabled.replace('{action}', action));
    return message.channel.send({ embeds: [embed] });
}

        // Validar y aplicar el comando "enable" para establecer la acción
        if (args[0]?.toLowerCase() === 'enable') {
            const action = args[1]?.toLowerCase();
        
            if (!['timeout', 'kick', 'ban'].includes(action)) {
                const embed = new EmbedBuilder()
                    .setColor('#f3b0ff')
                    .setDescription('<a:x_:1307446452913574071> ' + messages[lang].invalidAction);
                return message.channel.send({ embeds: [embed] });
            }
        
            const thresholds = args.slice(2);
        
            if (thresholds.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#f3b0ff')
                    .setDescription('<a:x_:1307446452913574071> ' + messages[lang].missingThreshold);
                return message.channel.send({ embeds: [embed] });
            }
        
            const parsedThresholds = [];
            for (const threshold of thresholds) {
                if (action === 'timeout') {
                    const [warns, time] = threshold.split(':');
        
                    if (!warns || !time || isNaN(warns) || parseInt(warns) <= 0) {
                        const embed = new EmbedBuilder()
                            .setColor('#f3b0ff')
                            .setDescription('<a:x_:1307446452913574071> ' + messages[lang].invalidTimeoutFormat);
                        return message.channel.send({ embeds: [embed] });
                    }
        
                    const parsedTime = ms(time);
                    if (!parsedTime || parsedTime <= 0) {
                        const embed = new EmbedBuilder()
                            .setColor('#f3b0ff')
                            .setDescription('<a:x_:1307446452913574071> ' + messages[lang].invalidTimeoutTime);
                        return message.channel.send({ embeds: [embed] });
                    }
        
                    parsedThresholds.push({ Warns: parseInt(warns), Timeout: parsedTime });
                } else {
                    if (isNaN(threshold) || parseInt(threshold) <= 0) {
                        const embed = new EmbedBuilder()
                            .setColor('#f3b0ff')
                            .setDescription('<a:x_:1307446452913574071> ' + messages[lang].invalidThreshold);
                        return message.channel.send({ embeds: [embed] });
                    }
        
                    parsedThresholds.push({ Warns: parseInt(threshold) }); // Sin campo Timeout
                }
            }
        
            const warnAction = await WarnAction.findOne({ GuildId: guildId });
            if (warnAction) {
                const existingAction = warnAction.Actions.find(a => a.Action === action);
                if (existingAction) {
                    for (const newThreshold of parsedThresholds) {
                        const alreadyExists = existingAction.Thresholds.some(th => th.Warns === newThreshold.Warns);
                        if (!alreadyExists) {
                            existingAction.Thresholds.push(newThreshold);
                        }
                    }
                } else {
                    warnAction.Actions.push({ Action: action, Thresholds: parsedThresholds });
                }
                await warnAction.save();
            } else {
                const newWarnAction = new WarnAction({
                    GuildId: guildId,
                    Actions: [{ Action: action, Thresholds: parsedThresholds }]
                });
                await newWarnAction.save();
            }
        
            const embed = new EmbedBuilder()
                .setColor('#f3b0ff')
                .setDescription('<a:tick:1307446418633527406>' + messages[lang].actionSet.replace('{action}', action).replace('{threshold}', thresholds.join(', ')));
            return message.channel.send({ embeds: [embed] });
        }
        
    },
};
