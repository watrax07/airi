const messages = {
    es: {
        setupRequired: 'Debes usar `!setup` para configurar el bot en este servidor.',
        noPermissions: 'No tienes permisos para aplicar un timeout.',
        botError: 'No tengo suficientes permisos para aplicar un timeout.',
        mentionUser: 'Debes mencionar a un usuario o proporcionar su ID.',
        cannotTimeoutBot: 'No puedes aplicar un timeout a un bot.',
        higherRank: 'No puedes aplicar un timeout a un miembro con un rango más alto que el mío.',
        cannotTimeoutHigherPerms: 'No puedes aplicar un timeout a un miembro con permisos más altos que los tuyos.',
        invalidValue: 'El valor proporcionado no es válido. Usa números positivos.',
        invalidFormat: 'El formato no es válido. Usa `d` para días y `m` para minutos.',
        noDuration: 'No proporcionaste una duración válida para el timeout.',
        timeoutSuccess: '{user} ha recibido un timeout de {duration} minutos.',
        timeoutError: 'Hubo un error al intentar aplicar el timeout.',
        timeoutReason: 'Timeout aplicado por {user} durante {duration} minutos.'
    },
    en: {
        setupRequired: 'You must use `!setup` to configure the bot on this server.',
        noPermissions: 'You do not have permission to apply a timeout.',
        botError: 'I do not have enough permissions to apply a timeout.',
        mentionUser: 'You must mention a user or provide their ID.',
        cannotTimeoutBot: 'You cannot apply a timeout to a bot.',
        higherRank: 'You cannot apply a timeout to a member with a higher rank than mine.',
        cannotTimeoutHigherPerms: 'You cannot apply a timeout to a member with higher permissions than yours.',
        invalidValue: 'The value provided is not valid. Use positive numbers.',
        invalidFormat: 'The format is not valid. Use `d` for days and `m` for minutes.',
        noDuration: 'You did not provide a valid duration for the timeout.',
        timeoutSuccess: '{user} has been given a timeout of {duration} minutes.',
        timeoutError: 'There was an error trying to apply the timeout.',
        timeoutReason: 'Timeout applied by {user} for {duration} minutes.'
    },
    fr: {
        setupRequired: 'Vous devez utiliser `!setup` pour configurer le bot sur ce serveur.',
        noPermissions: 'Vous n\'avez pas la permission d\'appliquer un timeout.',
        botError: 'Je n\'ai pas assez de permissions pour appliquer un timeout.',
        mentionUser: 'Vous devez mentionner un utilisateur ou fournir son ID.',
        cannotTimeoutBot: 'Vous ne pouvez pas appliquer un timeout à un bot.',
        higherRank: 'Vous ne pouvez pas appliquer un timeout à un membre avec un rang supérieur au mien.',
        cannotTimeoutHigherPerms: 'Vous ne pouvez pas appliquer un timeout à un membre ayant des permissions supérieures aux vôtres.',
        invalidValue: 'La valeur fournie n\'est pas valide. Utilisez des nombres positifs.',
        invalidFormat: 'Le format n\'est pas valide. Utilisez `d` pour les jours et `m` pour les minutes.',
        noDuration: 'Vous n\'avez pas fourni une durée valide pour le timeout.',
        timeoutSuccess: '{user} a reçu un timeout de {duration} minutes.',
        timeoutError: 'Une erreur s\'est produite lors de l\'application du timeout.',
        timeoutReason: 'Timeout appliqué par {user} pendant {duration} minutes.'
    }
};

module.exports = messages;
