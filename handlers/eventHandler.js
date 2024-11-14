// handlers/eventHandler.js
const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const eventsFolder = path.join(__dirname, '../events');
    const subcarpetas = fs.readdirSync(eventsFolder).filter(f => fs.statSync(path.join(eventsFolder, f)).isDirectory());
    const eventList = [];

    subcarpetas.forEach(subcarpeta => {
        const subcarpetaPath = path.join(eventsFolder, subcarpeta);
        const archivos = fs.readdirSync(subcarpetaPath).filter(f => f.endsWith('.js'));

        archivos.forEach(file => {
            const event = require(path.join(subcarpetaPath, file));

            if (event.name) {
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(client, ...args));
                } else {
                    client.on(event.name, (...args) => event.execute(client, ...args));
                }
                eventList.push({ Evento: event.name }); // Solo agregar el nombre del evento
            } else {
                console.error(`❌ El evento en **${file}** no tiene un nombre.`);
            }
        });
    });

    console.table(eventList);   
};
