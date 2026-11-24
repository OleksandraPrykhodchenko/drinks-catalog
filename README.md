# Каталог рецептів напоїв

Навчальний проєкт з курсу «Програмування веб-застосувань», варіант 15.
Виконала: Приходченко Олександра, ІП-о51.

## Запуск

```bash
cd server
npm start
```

Застосунок відкривається на http://localhost:3000. Сервер (`server/server.js`) віддає і сторінку,
і API: `GET /api/cocktails?search=...`, `GET /api/cocktails/:id`.

## Безпека (практична робота 15)

### XSS через innerHTML

Перевірено всі місця з `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `v-html` і `eval` у
`index.html`, `js/script.js`, `server/server.js`.

| Місце | Що туди потрапляє | Висновок |
|---|---|---|
| `script.js`: `renderDrinks`, `renderSaved`, `loadData`, `mountTemplate`, `renderDetail`, `renderNotFound` (7 рядків) | лише порожній рядок `''`, щоб очистити контейнер | безпечно |
| поле `instructions` рецепта (вектор варіанта 15) | текст з API, виводиться через `createEl` → `textContent` | безпечно, HTML не виконується |
| шаблони Vue (`{{ }}`) | дані каталогу | Vue екранує інтерполяцію, `v-html` не використовується |

Перевірка: у дані сервера тимчасово додано рецепт з `instructions = <img src=x onerror="alert('XSS')">`.
Застосунок показав рядок як текст, alert не з'явився.
Для порівняння той самий рядок, вставлений через `innerHTML`, без захисту викликав alert.

Що зроблено:

* сервер надсилає `Content-Security-Policy` без `'unsafe-inline'` для скриптів, тому inline-обробники
  (`onerror`, `onclick`) не виконуються, навіть якщо HTML колись потрапить у `innerHTML`;
* додано `X-Content-Type-Options: nosniff` і `Referrer-Policy: no-referrer`;
* Vue підключено з точною версією `vue@3.5.46` і хешем `integrity` (SRI) замість `vue@3`;
* адреса зображення з API (`strDrinkThumb`) приймається лише як `https://...` або локальний файл з `assets/` (`safeImageUrl`).

Обмеження: CSP містить `'unsafe-eval'`, бо глобальна збірка Vue компілює шаблон `#app` у браузері.
Щоб прибрати його, шаблони треба компілювати заздалегідь (збірка через Vite).

### localStorage та IndexedDB

* `localStorage`: `appItems` (рецепти, якщо IndexedDB недоступна) і прапорець `migrated`.
* IndexedDB `DrinksDB` → `cocktails`: збережені рецепти (`id`, `name`, `ingredients`, `instructions`, `img`).

Особистих даних, паролів чи токенів там немає, лише публічні рецепти, тому зберігати їх без шифрування й без
терміну дії допустимо. Будь-який скрипт сторінки може їх прочитати, тож туди не можна класти нічого приватного.

### Секрети

Ключів API і паролів у коді немає. Колишній ключ TheCocktailDB `1` був публічним тестовим, а з практичної 14
застосунок працює з власним сервером без ключів.

### HTTPS

Локально сервер працює по HTTP, для `localhost` браузер це дозволяє. Для фінальної здачі застосунок
планую розгорнути на хостингу Node.js з HTTPS за замовчуванням (наприклад, Render), тому що статичний
GitHub Pages не запустить `server.js`. Після розгортання варто додати заголовок `Strict-Transport-Security`.
