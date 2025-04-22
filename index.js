// filepath: c:\Users\User\Desktop\proiect TEHNICI WEB\index.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Setăm EJS ca motor de template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Definim folderul static
app.use('/resurse', express.static(path.join(__dirname, 'resurse')));

// Afișăm informații despre căile fișierului
console.log('Calea folderului (__dirname):', __dirname);
console.log('Calea fișierului (__filename):', __filename);
console.log('Folderul curent de lucru (process.cwd()):', process.cwd());

// Răspuns pentru ruta principală
app.get('/', (req, res) => {
    res.render('pagini/index');
});

// Pornim serverul
app.listen(PORT, () => {
    console.log(`Serverul rulează pe http://localhost:${PORT}`);
});