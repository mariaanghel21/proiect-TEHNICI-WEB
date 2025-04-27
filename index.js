const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

const obGlobal = {
    obErori: null 
};

// Vector cu numele folderelor de creat
const vect_foldere = ['temp']; // Adaugă și 'temp1' pentru testare, dacă este necesar

// Iterăm prin vector și verificăm dacă folderele există
vect_foldere.forEach((folder) => {
    const folderPath = path.join(__dirname, folder);

    // Verificăm dacă folderul există
    if (!fs.existsSync(folderPath)) {
        // Dacă nu există, îl creăm
        fs.mkdirSync(folderPath);
        console.log(`Folderul ${folder} a fost creat.`);
    } else {
        console.log(`Folderul ${folder} există deja.`);
    }
});

function initErori() {
    try {
        const caleErori = path.join(__dirname, 'resurse', 'json', 'erori.json');
        const continut = fs.readFileSync(caleErori, 'utf-8');
        const obErori = JSON.parse(continut);

        const caleBaza = path.join(__dirname, obErori.cale_baza);
        obErori.info_erori.forEach(eroare => {
            eroare.imagine = path.join(caleBaza, eroare.imagine);
        });

        obGlobal.obErori = obErori;

        console.log('Erorile au fost inițializate cu succes.');
    } catch (err) {
        console.error('Eroare la inițializarea erorilor:', err);
    }
}

// Apelăm funcția initErori pentru a încărca erorile în memorie
initErori();

// Configurări EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware pentru a bloca accesul la fișiere .ejs
app.use((req, res, next) => {
    if (req.url.endsWith('.ejs')) {
        afisareEroare(res, 400);
    } else {
        next();
    }
});

// Middleware pentru a verifica cererile către directoarele din /resurse
app.use('/resurse', (req, res, next) => {
    const requestedPath = path.join(__dirname, req.url);

    if (fs.existsSync(requestedPath) && fs.lstatSync(requestedPath).isDirectory()) {
        afisareEroare(res, 403);
    } else {
        next();
    }
});

// Middleware pentru resurse statice
app.use('/resurse', express.static(path.join(__dirname, 'resurse')));

// Funcția afisareEroare
function afisareEroare(res, identificator = null, titlu = null, text = null, imagine = null) {
    let eroare = obGlobal.obErori.info_erori.find(e => e.identificator === identificator) || obGlobal.obErori.eroare_default;

    titlu = titlu || eroare.titlu;
    text = text || eroare.text;
    imagine = imagine || `/resurse/imagini/erori/${path.basename(eroare.imagine)}`;

    if (identificator) {
        res.status(identificator);
    }

    res.render('pagini/eroare', {
        eroare: {
            titlu: titlu,
            text: text,
            imagine: imagine
        }
    });
}

// Rută pentru favicon.ico
app.get('/favicon.ico', (req, res) => {
    const faviconPath = path.join(__dirname, 'resurse', 'imagini', 'favicon', 'favicon.ico');
    res.sendFile(faviconPath);
});

// Rută pentru pagina principală
app.get(['/', '/index', '/home'], (req, res) => {
    const userIp = req.ip;
    res.render('pagini/index', { ip: userIp });
});

// Rută generală pentru orice altă pagină
app.get('/:page', async (req, res) => {
    const requestedPage = req.params.page;

    if (requestedPage === 'favicon.ico') {
        return res.status(204).end();
    }

    const templatePath = path.join(__dirname, 'views', 'pagini', `${requestedPage}.ejs`);

    try {
        await fs.promises.access(templatePath);

        res.render(`pagini/${requestedPage}`, (err, renderedHtml) => {
            if (err) {
                console.error('Eroare la randare:', err);

                if (err.message.startsWith('Failed to lookup view')) {
                    afisareEroare(res, 404);
                } else {
                    afisareEroare(res, 500);
                }
            } else {
                res.send(renderedHtml);
            }
        });
    } catch (err) {
        afisareEroare(res, 404);
    }
});

// Pornim serverul
app.listen(PORT, () => {
    console.log(`Serverul ruleaza pe http://localhost:${PORT}`);
});