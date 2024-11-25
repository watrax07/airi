const messages = {
    es: {
        title: '🔨 Usuario Baneado',
        description: 'El usuario **{userTag}** fue baneado.',
        userId: 'ID del Usuario',
        reason: 'Razón',
        executor: 'Ejecutado por',
        unknown: 'Desconocido',
        noReason: 'No especificada',
        noPermission: 'El bot no tiene permisos para enviar mensajes o enlaces en el canal configurado.',
    },
    en: {
        title: '🔨 User Banned',
        description: 'The user **{userTag}** was banned.',
        userId: 'User ID',
        reason: 'Reason',
        executor: 'Executor',
        unknown: 'Unknown',
        noReason: 'Not specified',
        noPermission: 'The bot does not have permissions to send messages or embed links in the configured channel.',
    },
    fr: {
        title: '🔨 Utilisateur Banni',
        description: 'L\'utilisateur **{userTag}** a été banni.',
        userId: 'ID de l\'Utilisateur',
        reason: 'Raison',
        executor: 'Exécuté par',
        unknown: 'Inconnu',
        noReason: 'Non spécifiée',
        noPermission: 'Le bot n\'a pas les permissions pour envoyer des messages ou des liens dans le canal configuré.',
    },
};

module.exports = messages;
