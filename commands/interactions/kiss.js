const client = require('nekos.life');
const neko = new client();
const { EmbedBuilder } = require('discord.js');
const GuildSetup = require('../../Schemas/guildSetup'); // Importa el modelo de la configuración de la guild

module.exports = {
    name: 'kiss',
    description: 'Besa a alguien.',
    owner: false,
    category: 'Interact',
    async execute(message, args) {
        const guildId = message.guild.id;

        const guild = await GuildSetup.findOne({ guildId });
        if (!guild || !guild.isSetupComplete) {
            return message.channel.send('Debes ejecutar el comando !setup antes de usar este comando.');
        }

   

        const usuario = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        
        if (!usuario) return message.channel.send(` Menciona a un usuario válido.`);
        if (usuario.id === message.author.id) return message.channel.send(` WTF, no te puedes besar tú mismo.`);
        if (usuario.user.bot) return message.channel.send(` WTF, no puedes besar bots.`);

        try {
            const image = await neko.sfw.kiss();
            const mbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle(`${message.author.username} besó a ${usuario.user.username}!`)
                .setImage(image.url)
                .setTimestamp();

            await message.channel.send({ embeds: [mbed] });
        } catch (error) {
            console.error(error);
            await message.channel.send('Ocurrió un error al intentar ejecutar el comando. 😢');
        }
    },
};
