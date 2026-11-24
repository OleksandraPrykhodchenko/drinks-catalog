/*
   Практична №14: найпростіший сервер на вбудованому модулі http (без залежностей).
   Обрано http, а не Express: потрібні лише два GET-ендпоінти і роздача статичних файлів,
   а це вміщується в кілька десятків рядків без npm install.

   Ендпоінти варіанта 15 (заміна TheCocktailDB):
     GET /api/cocktails?search=...  - локальний пошук за назвою, відповідь { drinks: [...] | null }
     GET /api/cocktails/:id         - один рецепт { drinks: [ {...} ] } або 404
   Решта запитів - статичні файли застосунку з батьківської теки (index.html, css/, js/, assets/).
*/
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');          // тека клієнтської частини (практикуми 1-13)
const PUBLIC = ['/index.html', '/css/', '/js/', '/assets/']; // роздаємо лише ці файли, не server/ і не .git

// Локальні дані: 8 рецептів у тій самій формі, що й відповідь TheCocktailDB
const cocktails = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'cocktails.json'), 'utf8'));

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
};

// Відповідь у форматі JSON з правильним Content-Type і статус-кодом
function sendJson(res, status, data) {
    res.writeHead(status, { 'Content-Type': MIME['.json'] });
    res.end(JSON.stringify(data));
}

// GET /api/cocktails?search=... - пошук без урахування регістру за входженням у назву.
// Як і TheCocktailDB, порожній результат - це 200 і drinks: null, а не помилка.
function searchCocktails(res, search) {
    const query = (search || '').trim().toLowerCase();
    const found = cocktails.filter(item => item.strDrink.toLowerCase().includes(query));
    sendJson(res, 200, { drinks: found.length ? found : null });
}

// GET /api/cocktails/:id - один рецепт або 404 з JSON-повідомленням
function getCocktail(res, id) {
    const item = cocktails.find(c => c.idDrink === id);
    if (!item) return sendJson(res, 404, { error: `Рецепт з id ${id} не знайдено` });
    sendJson(res, 200, { drinks: [item] });
}

// Роздача статичних файлів застосунку
function serveStatic(res, pathname) {
    if (pathname === '/') pathname = '/index.html';
    // Спершу нормалізуємо шлях (path.join прибирає «..»), і лише потім перевіряємо, що файл
    // лежить у дозволеній частині застосунку. Так запит /css/%2e%2e/server/server.js не віддасть код сервера.
    const filePath = path.join(ROOT, pathname);
    const relative = '/' + path.relative(ROOT, filePath).split(path.sep).join('/');
    const allowed = PUBLIC.some(prefix => relative === prefix || relative.startsWith(prefix));
    if (!allowed) {
        return sendJson(res, 404, { error: 'Не знайдено' });
    }
    fs.readFile(filePath, (err, content) => {
        if (err) return sendJson(res, 404, { error: 'Не знайдено' });
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        res.end(content);
    });
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    console.log(`${req.method} ${req.url}`);

    // Некоректне %-кодування в адресі не повинне «покласти» сервер
    let pathname;
    try {
        pathname = decodeURIComponent(url.pathname);
    } catch {
        return sendJson(res, 400, { error: 'Некоректна адреса запиту' });
    }

    if (req.method !== 'GET') {
        return sendJson(res, 405, { error: 'Підтримується лише GET' });
    }

    if (pathname === '/api/cocktails') {
        return searchCocktails(res, url.searchParams.get('search'));
    }
    const match = pathname.match(/^\/api\/cocktails\/([^/]+)$/);
    if (match) {
        return getCocktail(res, match[1]);
    }
    if (pathname.startsWith('/api/')) {
        return sendJson(res, 404, { error: 'Такого ендпоінта немає' });
    }
    serveStatic(res, pathname);
});

server.listen(PORT, () => console.log(`Сервер запущено на http://localhost:${PORT}`));
