"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
fs.readFile('./in/purgedPO.csv', 'utf8', function (err, data) {
    if (err)
        throw err;
    const lignes = data.split('\n');
    const titles = lignes[0].split(' ')[0].split('\\');
    const donnees = lignes.slice(1).map((ligne) => {
        const colonnes = ligne.split('  ');
        const objet = {};
        titles.forEach((enTete, index) => {
            objet[enTete] = colonnes[index];
        });
        return objet;
    });
    console.log(lignes[0].split('\\'));
});
