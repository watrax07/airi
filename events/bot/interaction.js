// events/interactionCreate.js
module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(client, interaction) {
        if (!interaction.isCommand()) return; // Verifica si es un comando slash

        const command = client.slashCommands.get(interaction.commandName); // Obtiene el comando basado en el nombre

        if (!command) return; // Si no existe el comando, sale

        try {
            await command.execute(interaction); // Ejecuta el comando
        } catch (error) {
            console.error(error);
        }
    },
};
