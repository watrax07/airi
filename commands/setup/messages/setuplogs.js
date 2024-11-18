const messages = {
    es: {
        setupRequired: 'Debes usar `!setup` para configurar el bot en este servidor.',
        noPermissionInteraction: 'No puedes interactuar con esta configuración.',
        invalidCategory: 'Categoría inválida, revisa que no se esté ejecutando otro menú dentro del canal. Vuelve a intentarlo en unos minutos.',
        selectPlaceholder: 'Selecciona una categoría de logs',
        mainMenu: {
            title: 'Configuración de Logs - Categorías',
            description: 'Selecciona una categoría para configurar los logs correspondientes.',
        },
        loading: {
            title: 'Configuración de Logs',
            description: 'Cargando menú...',
        },
        selectLogType: 'Selecciona qué logs deseas activar/desactivar.',
        logEnabledButton: '{logType} (Activado)',
        logDisabledButton: '{logType} (Desactivado)',
        backToMenu: 'Regresar al Menú',
        enterChannelId: 'Por favor, escribe el ID del canal donde deseas recibir los logs de {logType}.',
        invalidChannelId: 'ID de canal inválido. Asegúrate de ingresar un canal de texto válido.',
        logEnabledMessage: 'Los logs de {logType} ahora se enviarán a {channel}.',
        logDisabledMessage: 'El log de {logType} ha sido desactivado.',
        generalError: 'Hubo un problema al configurar los logs. Por favor, inténtalo nuevamente.',
        categories: {
            member: {
                label: 'Miembro',
                description: 'Logs relacionados con miembros',
                title: 'Configuración de Logs - Miembros',
            },
            message: {
                label: 'Mensajes',
                description: 'Logs de mensajes',
                title: 'Configuración de Logs - Mensajes',
            },
            role: {
                label: 'Roles',
                description: 'Logs relacionados con roles',
                title: 'Configuración de Logs - Roles',
            },
            channel: {
                label: 'Canales',
                description: 'Logs de canales',
                title: 'Configuración de Logs - Canales',
            },
            mod: {
                label: 'Moderación',
                description: 'Logs de moderación',
                title: 'Configuración de Logs - Moderación',
            },
        },
    },
    en: {
        setupRequired: 'You must use `!setup` to configure the bot on this server.',
        noPermissionInteraction: 'You cannot interact with this setup.',
        invalidCategory: 'Invalid category, check that no other menu is running in this channel. Please try again in a few minutes.',
        selectPlaceholder: 'Select a log category',
        mainMenu: {
            title: 'Log Configuration - Categories',
            description: 'Select a category to configure its logs.',
        },
        loading: {
            title: 'Log Configuration',
            description: 'Loading menu...',
        },
        selectLogType: 'Select which logs you want to enable/disable.',
        logEnabledButton: '{logType} (Enabled)',
        logDisabledButton: '{logType} (Disabled)',
        backToMenu: 'Back to Menu',
        enterChannelId: 'Please type the channel ID where you want to receive {logType} logs.',
        invalidChannelId: 'Invalid channel ID. Make sure to provide a valid text channel.',
        logEnabledMessage: 'Logs for {logType} are now sent to {channel}.',
        logDisabledMessage: 'The log for {logType} has been disabled.',
        generalError: 'There was an issue setting up the logs. Please try again.',
        categories: {
            member: {
                label: 'Member',
                description: 'Logs related to members',
                title: 'Log Configuration - Members',
            },
            message: {
                label: 'Messages',
                description: 'Message logs',
                title: 'Log Configuration - Messages',
            },
            role: {
                label: 'Roles',
                description: 'Logs related to roles',
                title: 'Log Configuration - Roles',
            },
            channel: {
                label: 'Channels',
                description: 'Channel logs',
                title: 'Log Configuration - Channels',
            },
            mod: {
                label: 'Moderation',
                description: 'Moderation logs',
                title: 'Log Configuration - Moderation',
            },
        },
    },
    fr: {
        setupRequired: 'Vous devez utiliser `!setup` pour configurer le bot sur ce serveur.',
        noPermissionInteraction: 'Vous ne pouvez pas interagir avec cette configuration.',
        invalidCategory: "Catégorie invalide, vérifiez qu'aucun autre menu n'est en cours d'exécution dans ce canal. Veuillez réessayer dans quelques minutes.",
        selectPlaceholder: 'Sélectionnez une catégorie de logs',
        mainMenu: {
            title: 'Configuration des Logs - Catégories',
            description: 'Sélectionnez une catégorie pour configurer ses logs.',
        },
        loading: {
            title: 'Configuration des Logs',
            description: 'Chargement du menu...',
        },
        selectLogType: 'Sélectionnez quels logs vous souhaitez activer/désactiver.',
        logEnabledButton: '{logType} (Activé)',
        logDisabledButton: '{logType} (Désactivé)',
        backToMenu: 'Retour au Menu',
        enterChannelId: 'Veuillez saisir l\'ID du canal où vous souhaitez recevoir les logs de {logType}.',
        invalidChannelId: 'ID de canal invalide. Assurez-vous de fournir un canal textuel valide.',
        logEnabledMessage: 'Les logs de {logType} seront désormais envoyés à {channel}.',
        logDisabledMessage: 'Le log de {logType} a été désactivé.',
        generalError: 'Un problème est survenu lors de la configuration des logs. Veuillez réessayer.',
        categories: {
            member: {
                label: 'Membre',
                description: 'Logs liés aux membres',
                title: 'Configuration des Logs - Membres',
            },
            message: {
                label: 'Messages',
                description: 'Logs de messages',
                title: 'Configuration des Logs - Messages',
            },
            role: {
                label: 'Rôles',
                description: 'Logs liés aux rôles',
                title: 'Configuration des Logs - Rôles',
            },
            channel: {
                label: 'Canaux',
                description: 'Logs des canaux',
                title: 'Configuration des Logs - Canaux',
            },
            mod: {
                label: 'Modération',
                description: 'Logs de modération',
                title: 'Configuration des Logs - Modération',
            },
        },
    },
};

module.exports = messages;
