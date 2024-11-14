// commands/general/help.js
module.exports = {
    name: 'help',
    description: 'Muestra la lista de comandos disponibles.',
    owner: false,
    category: 'General',
    execute(message, args) {
        const prefixCommands = message.client.commands.map(cmd => {
            return `\`${cmd.name}\` - **${cmd.category}**: ${cmd.description}`;
        }).join('\n');

        const helpMessage = `
**Comandos de Prefijo:**
${prefixCommands || 'No hay comandos de prefijo disponibles.'}
        `;

        message.channel.send(helpMessage);
    },
};
