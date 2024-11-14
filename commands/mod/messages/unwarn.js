// messages/unwarn.js
module.exports = {
    es: {
        setupRequired: 'You must use `!setup` to configure the bot on this server.',
        mentionUser: '¡Por favor menciona a un usuario del que quieras eliminar la advertencia!',
        noWarnNumber: '¡Por favor indica el número de advertencia que deseas eliminar!',
        invalidNumber: '¡El número de advertencia debe ser un número válido!',
        warnNotFound: '¡No hay advertencia con el número {warnNumber} para {user}!',
        unwarnSuccess: '¡{user} ha sido desadvertido de la advertencia #{warnNumber}!',
        unwarnError: 'Hubo un error al intentar eliminar la advertencia.',
    },
    en: {
        setupRequired: 'The server setup is not complete. Please complete the setup first.',
        mentionUser: 'Please mention a user you want to remove the warning from!',
        noWarnNumber: 'Please specify the warning number you wish to remove!',
        invalidNumber: 'The warning number must be a valid number!',
        warnNotFound: 'There is no warning with number {warnNumber} for {user}!',
        unwarnSuccess: '{user} has been unwarned from warning #{warnNumber}!',
        unwarnError: 'There was an error trying to remove the warning.',
    },
    fr: {
        setupRequired: 'La configuration du serveur n\'est pas complète. Veuillez d\'abord terminer la configuration.',
        mentionUser: 'Veuillez mentionner un utilisateur dont vous souhaitez supprimer l\'avertissement!',
        noWarnNumber: 'Veuillez indiquer le numéro d\'avertissement que vous souhaitez supprimer!',
        invalidNumber: 'Le numéro d\'avertissement doit être un nombre valide!',
        warnNotFound: 'Il n\'y a pas d\'avertissement avec le numéro {warnNumber} pour {user}!',
        unwarnSuccess: '{user} a été désaverti de l\'avertissement #{warnNumber}!',
        unwarnError: 'Une erreur s\'est produite lors de la suppression de l\'avertissement.',
    },
};
