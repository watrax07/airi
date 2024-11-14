// messages/timeout.js
module.exports = {
    es: {
        setupRequired: 'You must use `!setup` to configure the bot on this server.',
        mentionUser: '¡Por favor menciona a un usuario al que quieras aplicar el timeout!',
        invalidValue: '¡Los valores de tiempo deben ser mayores a cero!',
        invalidFormat: '¡Formato incorrecto! Usa "d" para días y "m" para minutos (ej: 1d o 30m).',
        timeoutSuccess: '¡{user} ha sido puesto en timeout por {duration} minutos!',
        timeoutError: 'Hubo un error al intentar aplicar el timeout. Asegúrate de que tengo permisos para hacerlo.',
    },
    en: {
        setupRequired: 'The server setup is not complete. Please complete the setup first.',
        mentionUser: 'Please mention a user you want to timeout!',
        invalidValue: 'Time values must be greater than zero!',
        invalidFormat: 'Incorrect format! Use "d" for days and "m" for minutes (e.g., 1d or 30m).',
        timeoutSuccess: '{user} has been timed out for {duration} minutes!',
        timeoutError: 'There was an error trying to apply the timeout. Ensure I have permission to do so.',
    },
    fr: {
        setupRequired: 'La configuration du serveur n\'est pas complète. Veuillez d\'abord terminer la configuration.',
        mentionUser: 'Veuillez mentionner un utilisateur à qui vous souhaitez appliquer le timeout!',
        invalidValue: 'Les valeurs de temps doivent être supérieures à zéro!',
        invalidFormat: 'Format incorrect! Utilisez "d" pour les jours et "m" pour les minutes (ex: 1d ou 30m).',
        timeoutSuccess: '{user} a été mis en timeout pendant {duration} minutes!',
        timeoutError: 'Une erreur s\'est produite lors de l\'application du timeout. Assurez-vous que j\'ai l\'autorisation de le faire.',
    },
};
