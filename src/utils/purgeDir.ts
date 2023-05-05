import * as fs from 'fs'
const purgeDir = (directoryPath: string) => {

// Lire tous les fichiers et dossiers dans le dossier
const files = fs.readdirSync(directoryPath);

// Supprimer chaque fichier
files.forEach(file => {
  const filePath = `${directoryPath}/${file}`;
  fs.unlinkSync(filePath);
});

}

export default purgeDir
