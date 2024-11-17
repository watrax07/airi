const messages = {
    es: {
        setupRequired: 'Debes usar `!setup` para configurar el bot en este servidor.',
        noPermissions: 'No tienes permisos para eliminar un timeout.',
        botError: 'No tengo suficientes permisos para eliminar un timeout.',
        mentionUser: 'Debes mencionar a un usuario o proporcionar su ID.',
        noActiveTimeout: '{user} no tiene un timeout activo.',
        timeoutRemoved: 'El timeout de {user} ha sido eliminado correctamente.',
        timeoutError: 'Hubo un error al intentar eliminar el timeout.',
        timeoutRemovedReason: 'Timeout eliminado por {user}.'
    },
    en: {
        setupRequired: 'You must use `!setup` to configure the bot on this server.',
        noPermissions: 'You do not have permission to remove a timeout.',
        botError: 'I do not have enough permissions to remove a timeout.',
        mentionUser: 'You must mention a user or provide their ID.',
        noActiveTimeout: '{user} does not have an active timeout.',
        timeoutRemoved: 'The timeout for {user} has been successfully removed.',
        timeoutError: 'There was an error trying to remove the timeout.',
        timeoutRemovedReason: 'Timeout removed by {user}.'
    },
    fr: {
        setupRequired: 'Vous devez utiliser `!setup` pour configurer le bot sur ce serveur.',
        noPermissions: 'Vous n\'avez pas la permission de supprimer un timeout.',
        botError: 'Je n\'ai pas assez de permissions pour supprimer un timeout.',
        mentionUser: 'Vous devez mentionner un utilisateur ou fournir son ID.',
        noActiveTimeout: '{user} n\'a pas de timeout actif.',
        timeoutRemoved: 'Le timeout de {user} a été supprimé avec succès.',
        timeoutError: 'Une erreur s\'est produite lors de la tentative de suppression du timeout.',
        timeoutRemovedReason: 'Timeout supprimé par {user}.'
    }
};

module.exports = messages;
