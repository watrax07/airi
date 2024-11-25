const { EmbedBuilder } = require('discord.js');
const WelcomeSettings = require('../../Schemas/welcomeSchema');

module.exports = {
    name: 'guildMemberAdd',
    async execute(client, member) {
        const guildId = member.guild.id;

        // Obtener configuración de bienvenida
        const welcomeSettings = await WelcomeSettings.findOne({ guildId });
        if (!welcomeSettings || !welcomeSettings.enabled || !welcomeSettings.channelId) return;

        const welcomeChannel = member.guild.channels.cache.get(welcomeSettings.channelId);
        if (!welcomeChannel) return;

        // Validar si la imagen o el thumbnail son URLs válidas
        const isValidURL = (string) => {
            try {
                new URL(string);
                return true;
            } catch (_) {
                return false;
            }
        };

        // Función para reemplazar placeholders
        const replacePlaceholders = (template) => {
            return template
                .replace('{user}', `<@${member.id}>`)
                .replace('{usertag}', member.user.tag)
                .replace('{membercount}', member.guild.memberCount);
        };

        // Crear el embed de bienvenida
        const embed = new EmbedBuilder()
            .setColor(welcomeSettings.color || '#00ff00')
            .setTitle(replacePlaceholders(welcomeSettings.title || 'Bienvenido'))
            .setDescription(
                replacePlaceholders(
                    welcomeSettings.description || '¡Bienvenido al servidor, {user}!'
                )
            );

        // Agregar thumbnail si es válido
        if (welcomeSettings.thumbnail && isValidURL(welcomeSettings.thumbnail)) {
            embed.setThumbnail(welcomeSettings.thumbnail);
        }

        // Agregar imagen si es válida
        if (welcomeSettings.image && isValidURL(welcomeSettings.image)) {
            embed.setImage(welcomeSettings.image);
        }

        // Agregar footer si está configurado
        if (welcomeSettings.footer && welcomeSettings.footer.trim().length > 0) {
            embed.setFooter({ text: replacePlaceholders(welcomeSettings.footer) });
        }

        // Enviar el mensaje adicional si está configurado
        if (welcomeSettings.welcomeMessage && welcomeSettings.welcomeMessage.trim().length > 0) {
            const plainMessage = replacePlaceholders(welcomeSettings.welcomeMessage);

            try {
                await welcomeChannel.send(plainMessage);
            } catch (error) {
                console.error(`No se pudo enviar el mensaje adicional en el canal ${welcomeSettings.channelId}:`, error);
            }
        }

        // Enviar el embed de bienvenida
        try {
            await welcomeChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error(`No se pudo enviar el embed de bienvenida en el canal ${welcomeSettings.channelId}:`, error);
        }
    },
};
