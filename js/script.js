/*
   Практична №10: обрано Vue 3 (глобальна збірка через CDN).
   Причина вибору: шаблон компонента пишеться як звичайна HTML-розмітка без Babel/JSX і збірки,
   а v-model та computed напряму відповідають завданню варіанта 15 (чекбокс-фільтр і похідні значення).
*/
console.log('script.js підключено');

// Практична №9: адреса ендпоінта TheCocktailDB (тестовий ключ «1», без реєстрації).
// Назву напою додаємо в кінець рядка.
const API_URL = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=';

// Складність нового рецепта визначаємо за часом приготування (у формі такого поля немає)
const getDifficulty = time => (time <= 10 ? 'Легко' : time <= 20 ? 'Середньо' : 'Складно');

// Допоміжна функція: створює елемент із тегом, текстом та (за потреби) класами.
// Лишається лише для блоку API з практикуму 9 (див. renderDrinks нижче).
function createEl(tag, text, ...classes) {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (classes.length) el.classList.add(...classes);
    return el;
}

// Функція перевіряє, чи готується напій 5 хвилин або швидше
const isQuick = time => time <= 5;

/*
   Крок 4 (Практична №10): компонент DrinkCard.
   Отримує дані лише через props (name, type, timeMinutes, alcohol + допоміжні поля),
   не звертається до глобальних змінних. Розмітка повторює картку з практикуму 7.
*/
const DrinkCard = {
    props: ['name', 'type', 'timeMinutes', 'alcohol', 'difficulty', 'description', 'img', 'imgAlt'],
    // Практична №12: клік (чи Enter) по картці повідомляє батьківський компонент, що рецепт треба відкрити
    emits: ['open'],
    computed: {
        typeClass() {
            return this.type === 'Гарячий' ? 'badge-hot' : 'badge-cold';
        },
        quick() {
            return isQuick(this.timeMinutes);
        }
    },
    template: `
        <article class="recipe-card recipe-card--openable" :class="{ 'non-alcoholic': !alcohol }" :data-time="timeMinutes"
                 tabindex="0" role="button" :aria-label="'Відкрити рецепт ' + name"
                 @click="$emit('open')" @keydown.enter="$emit('open')">
            <img v-if="img" :src="img" :alt="imgAlt">
            <div class="card-content">
                <div class="badges">
                    <span class="badge" :class="typeClass">{{ type }}</span>
                    <span v-if="alcohol" class="badge badge-alc">Алкогольний</span>
                    <span v-else class="badge badge-non-alc">Безалкогольний</span>
                </div>
                <h3>{{ name }}</h3>
                <div class="recipe-meta">
                    <span>⏱ {{ timeMinutes }} хв</span>
                    <span>📊 {{ difficulty }}</span>
                    <span v-if="quick">⚡ Швидко</span>
                </div>
                <p class="drink-type">Тип: {{ type }}</p>
                <p>{{ description }}</p>
            </div>
        </article>`
};

// Крок 3 і 6: дані — у реактивному стані (data()), фільтр і форма — у батьківському компоненті
const app = Vue.createApp({
    components: { DrinkCard },
    data() {
        return {
            // Масив об'єктів варіанта 15; id потрібен для :key
            recipes: [
                { id: 1, name: 'Кава Латте', type: 'Гарячий', alcohol: false, timeMinutes: 15, difficulty: 'Легко', description: 'Класичний кавовий напій з великою кількістю молока.', img: 'assets/img/latte.jpg', imgAlt: 'Склянка гарячого латте' },
                { id: 2, name: 'Мохіто', type: 'Холодний', alcohol: true, timeMinutes: 10, difficulty: 'Середньо', description: 'Освіжаючий напій на основі білого рому, м\'яти та лайма.', img: 'assets/img/mojito.jpg', imgAlt: 'Холодний коктейль мохіто з м\'ятою та лаймом' },
                { id: 3, name: 'Домашній Лимонад', type: 'Холодний', alcohol: false, timeMinutes: 20, difficulty: 'Легко', description: 'Прохолодний літній напій зі свіжих лимонів та сиропу.', img: 'assets/img/lemonade.jpg', imgAlt: 'Глек свіжого лимонаду з льодом та м\'ятою' },
                { id: 4, name: 'Глінтвейн', type: 'Гарячий', alcohol: true, timeMinutes: 25, difficulty: 'Легко', description: 'Зігріваючий напій на основі червоного вина зі спеціями та цитрусовими.', img: 'assets/img/glintveine.jpg', imgAlt: 'Келих гарячого глінтвейну зі спеціями' },
                { id: 5, name: 'Швидкий Експрес-чай', type: 'Гарячий', alcohol: false, timeMinutes: 3, difficulty: 'Легко', description: 'Швидкий гарячий напій з листового чаю та скибочки лимона.', img: 'assets/img/tea.jpg', imgAlt: 'Чашка гарячого чаю' }
            ],
            onlyNonAlcoholic: false, // значення чекбокса «лише безалкогольні»
            nextId: 6,
            newName: '',
            newType: 'Гарячий',
            newTime: null,
            newAlcohol: false,
            // Практична №12: стан вікна рецепта та анімації «наливання»
            selectedId: null,  // id відкритого рецепта (null - вікно закрите)
            filled: false,     // клас is-filled: рідина піднята до свого рівня
            pouring: false,    // клас is-pouring: тече струмінь, поки триває transition
            resetting: false   // клас is-reset: миттєво спорожнити склянку без зворотної анімації
        };
    },
    computed: {
        // Фільтр за значенням чекбокса: список перераховується автоматично
        visibleRecipes() {
            return this.onlyNonAlcoholic ? this.recipes.filter(recipe => !recipe.alcohol) : this.recipes;
        },
        // Похідне значення: кількість безалкогольних серед усіх даних (а не лише показаних)
        nonAlcoholicCount() {
            return this.recipes.filter(recipe => !recipe.alcohol).length;
        },
        // Назва з самих пробілів проходить required, тому перевіряємо її окремо
        nameError() {
            return this.newName !== '' && this.newName.trim() === ''
                ? 'Назва не може складатися лише з пробілів'
                : '';
        },
        // Практична №12: відкритий рецепт береться з того самого масиву recipes
        selected() {
            return this.recipes.find(recipe => recipe.id === this.selectedId) || null;
        },
        // Крок 4: параметри анімації обчислюються з даних рецепта, а не задані числами в CSS.
        // Колір рідини залежить від типу та наявності алкоголю, рівень - від посуду
        // (гарячі напої наливають у чашку не до краю), тривалість - від часу приготування.
        glassStyle() {
            const r = this.selected;
            if (!r) return {};
            const hot = r.type === 'Гарячий';
            const color = hot
                ? (r.alcohol ? '#7B1E2B' : '#8B5A2B')   // глінтвейн / кава, чай
                : (r.alcohol ? '#9BC53D' : '#F4D35E');  // мохіто / лимонад
            const level = hot ? 0.75 : 0.9;
            const seconds = Math.min(3, Math.max(0.8, r.timeMinutes / 8));
            return {
                '--drink-color': color,
                '--fill-level': level,
                '--pour-time': `${seconds.toFixed(2)}s`
            };
        }
    },
    methods: {
        // Крок 6: анімація запускається дією користувача - відкриттям картки
        openRecipe(id) {
            this.selectedId = id;
            this.pour();
            this.$nextTick(() => this.$refs.closeBtn?.focus());
        },
        // Скидаємо рідину до 0 (без transition) і лише потім ставимо клас is-filled, щоб анімація
        // програлася знову. Подвійний requestAnimationFrame гарантує, що браузер встиг
        // намалювати порожню склянку.
        pour() {
            this.resetting = true;
            this.filled = false;
            this.pouring = false;
            this.$nextTick(() => {
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    this.resetting = false;
                    this.filled = true;
                    this.pouring = true;
                }));
            });
        },
        // Крок 8: коли transition рідини завершився, зупиняємо @keyframes струменя
        onPourEnd(event) {
            if (event.propertyName === 'transform') this.pouring = false;
        },
        closeRecipe() {
            this.selectedId = null;
            this.filled = false;
            this.pouring = false;
        },
        addRecipe() {
            if (this.nameError || !(this.newTime > 0)) return;
            const name = this.newName.trim();
            this.recipes.push({
                id: this.nextId++,
                name,
                type: this.newType,
                alcohol: this.newAlcohol,
                timeMinutes: this.newTime,
                difficulty: getDifficulty(this.newTime),
                description: 'Рецепт додано користувачем.'
            });
            console.log(`Додано рецепт: ${name}. Усього рецептів: ${this.recipes.length}`);
            // Очищення форми
            this.newName = '';
            this.newType = 'Гарячий';
            this.newTime = null;
            this.newAlcohol = false;
        }
    }
}).mount('#app');

/*
   Крок 7 (Практична №10): ручний DOM-код практикумів 7-8 для списку #drinks-list
   (видалення статичних карток, renderFiltered, обробники change/submit, масив drinksRecipes)
   ЗАМІНЕНО компонентом Vue DrinkCard і реактивним станом вище, тому видалено.
   Функція renderDrinks нижче залишена лише тому, що її викликає блок API з практикуму 9 (#api-list).
*/

// Функція рендеру для блоку API (практикум 9): очищає контейнер і створює картку для кожного рецепта.
function renderDrinks(recipes, container, onSave) {
    container.innerHTML = '';

    // Якщо нічого не знайдено — показуємо повідомлення
    if (recipes.length === 0) {
        container.append(createEl('p', 'Рецептів за обраним фільтром немає.', 'empty-message'));
    }

    recipes.forEach(recipe => {
        const card = createEl('article', '', 'recipe-card');
        if (recipe.timeMinutes !== undefined) card.dataset.time = recipe.timeMinutes;

        // Рецепти з API мають зображення — тоді img створюємо
        const img = recipe.img ? document.createElement('img') : null;
        if (img) {
            img.src = recipe.img;
            img.setAttribute('alt', recipe.imgAlt);
        }

        const content = createEl('div', '', 'card-content');

        // Бейджі: дані з API можуть не містити частину полів, тому кожен бейдж створюємо лише за наявності даних.
        const badges = createEl('div', '', 'badges');
        if (recipe.type) {
            const typeClass = recipe.type === 'Гарячий' ? 'badge-hot' : 'badge-cold';
            badges.append(createEl('span', recipe.type, 'badge', typeClass));
        }
        if (recipe.alcohol === true) {
            badges.append(createEl('span', 'Алкогольний', 'badge', 'badge-alc'));
        } else if (recipe.alcohol === false) {
            badges.append(createEl('span', 'Безалкогольний', 'badge', 'badge-non-alc'));
        }

        const title = createEl('h3', recipe.name);

        if (badges.children.length) content.append(badges);
        content.append(title);

        if (recipe.timeMinutes !== undefined) {
            const meta = createEl('div', '', 'recipe-meta');
            meta.append(
                createEl('span', `⏱ ${recipe.timeMinutes} хв`),
                createEl('span', `📊 ${recipe.difficulty}`)
            );
            if (isQuick(recipe.timeMinutes)) {
                meta.append(createEl('span', '⚡ Швидко'));
            }
            content.append(meta);
        }

        if (recipe.type) {
            content.append(createEl('p', `Тип: ${recipe.type}`, 'drink-type'));
        }
        content.append(createEl('p', recipe.description));
        // Практична №11: кнопка «Зберегти рецепт» (лише для карток з API, які мають id)
        if (onSave && recipe.id) {
            const saveBtn = createEl('button', 'Зберегти рецепт', 'btn', 'btn-save');
            saveBtn.type = 'button';
            saveBtn.dataset.saveId = recipe.id;
            saveBtn.addEventListener('click', () => onSave(recipe));
            content.append(saveBtn);
        }
        if (img) card.append(img);
        card.append(content);

        // Умовний клас: безалкогольний напій
        if (recipe.alcohol === false) {
            card.classList.add('non-alcoholic');
        }

        container.append(card);
    });
}

const apiForm = document.querySelector('#api-search-form');
const apiQuery = document.querySelector('#api-query');
const apiSearchBtn = document.querySelector('#api-search-btn');
const apiRefreshBtn = document.querySelector('#api-refresh-btn');
const apiStatus = document.querySelector('#api-status');
const apiError = document.querySelector('#api-error');
const apiList = document.querySelector('#api-list');

// Остання успішно надіслана назва — її повторює кнопка «Оновити»
let lastQuery = apiQuery.value.trim();

// Створює помилку з зрозумілим для користувача повідомленням (details — для розробника)
function createApiError(userMessage, details) {
    const error = new Error(details);
    error.userMessage = userMessage;
    return error;
}

// Крок 7: стан завантаження — текст і заблоковані кнопки
function showLoading(isLoading) {
    apiStatus.textContent = 'Завантаження…';
    apiStatus.hidden = !isLoading;
    apiSearchBtn.disabled = isLoading;
    apiRefreshBtn.disabled = isLoading;
    apiList.setAttribute('aria-busy', String(isLoading));
}

// Крок 8: виведення зрозумілого повідомлення про помилку на сторінці
function showError(message) {
    apiError.textContent = message;
    apiError.hidden = false;
}

// Практична №11: API віддає інгредієнти окремими полями strIngredient1..15 і strMeasure1..15 —
// збираємо їх в один масив рядків виду «мірка інгредієнт»
function collectIngredients(item) {
    const result = [];
    for (let i = 1; i <= 15; i++) {
        const name = item[`strIngredient${i}`];
        if (!name) continue;
        const measure = item[`strMeasure${i}`];
        result.push(measure ? `${measure.trim()} ${name}` : name);
    }
    return result;
}

// Крок 6: зіставлення полів відповіді API з формою об'єкта, яку приймає renderDrinks
function mapApiDrink(item) {
    let alcohol; // undefined — API не дає однозначної відповіді (наприклад, «Optional alcohol»)
    if (item.strAlcoholic === 'Alcoholic') alcohol = true;
    if (item.strAlcoholic === 'Non alcoholic') alcohol = false;

    return {
        id: item.idDrink,
        name: item.strDrink,
        alcohol,
        ingredients: collectIngredients(item),
        instructions: item.strInstructions || 'Інструкцію не вказано.',
        description: item.strInstructions || 'Інструкцію не вказано.',
        img: item.strDrinkThumb,
        imgAlt: `Напій ${item.strDrink}`
    };
}

// Крок 2: асинхронна функція запиту до TheCocktailDB
// API: https://www.thecocktaildb.com/api/json/v1/1/search.php?s=<назва> (пошук коктейлю за назвою)
async function loadData(query = lastQuery) {
    lastQuery = query;
    showLoading(true);
    apiError.hidden = true;

    try {
        // Крок 3: запит і очікування відповіді
        const response = await fetch(API_URL + encodeURIComponent(query));

        // Крок 4: fetch не вважає 404/500 помилкою, тому перевіряємо response.ok вручну
        if (!response.ok) {
            throw createApiError(
                'Сервер рецептів тимчасово недоступний. Спробуйте пізніше.',
                `Сервер відповів кодом ${response.status}`
            );
        }

        // Крок 5: розбір тіла відповіді як JSON
        const data = await response.json();
        console.log(data);

        // Якщо нічого не знайдено, API повертає drinks === null (а не порожній масив)
        if (data.drinks === null) {
            throw createApiError('Рецептів за такою назвою не знайдено', `Порожня відповідь для «${query}»`);
        }
        if (!Array.isArray(data.drinks)) {
            throw createApiError('Отримано некоректну відповідь від сервера.', 'Поле drinks має неочікуваний формат');
        }

        // Крок 6: та сама функція рендеру з практикуму 7, але в інший контейнер
        renderDrinks(data.drinks.map(mapApiDrink), apiList, saveRecipe);
        markSavedButtons();
    } catch (error) {
        // Мережеві збої (TypeError від fetch) не мають userMessage — показуємо загальний текст
        apiList.innerHTML = '';
        showError(error.userMessage ?? 'Не вдалося завантажити рецепти. Перевірте з\'єднання та спробуйте ще раз.');
        console.error(error); // технічні деталі — лише для розробника
    } finally {
        // Крок 7: ховаємо індикатор як за успіху, так і за помилки
        showLoading(false);
    }
}

// Пошук за введеною назвою
apiForm.addEventListener('submit', event => {
    event.preventDefault();
    loadData(apiQuery.value.trim());
});

// Крок 10: кнопка «Оновити» повторює останній запит без перезавантаження сторінки
apiRefreshBtn.addEventListener('click', () => loadData());

// Початкове завантаження (margarita)
loadData();

/* ========================================================================
   Практична №11: локальні сховища (localStorage / IndexedDB)
   Варіант 15. Модель запису: { id, name, ingredients[], instructions, img }.
   Сховище "cocktails", keyPath "id". Сценарій: кнопка «Зберегти рецепт» на картці
   з результатів API записує рецепт в IndexedDB для офлайн-перегляду.
   ======================================================================== */

const LS_KEY = 'appItems';            // ключ localStorage зі збереженими рецептами
const LS_MIGRATED = 'migrated';       // прапорець завершеної міграції localStorage -> IndexedDB
const DB_NAME = 'DrinksDB';
const DB_VERSION = 1;
const STORE = 'cocktails';

// Крок 2: збереження в localStorage (рядок через JSON.stringify)
function saveToLocalStorage(items) {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
}

// Крок 2: читання з localStorage; пошкоджений JSON не має «валити» застосунок
function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        console.error('Пошкоджені дані в localStorage:', error);
        return [];
    }
}

// Кроки 5-6: відкриття бази. onupgradeneeded спрацьовує лише при створенні/підвищенні версії,
// саме тут створюється object store з ключем id.
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Крок 7: додати або оновити запис (put працює і для нового, і для наявного id)
async function addItem(item) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// Крок 7: оновлення — те саме put з тим самим id
const updateItem = addItem;

// Крок 7: прочитати всі записи (транзакція readonly)
async function getAllItems() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const request = tx.objectStore(STORE).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Крок 7: видалити запис за id (транзакція readwrite)
async function deleteItem(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// Крок 8: одноразова міграція. Якщо сховище порожнє, а в localStorage є старі дані — переносимо їх
// і ставимо прапорець, щоб не повторювати перенесення при наступних завантаженнях.
async function migrateFromLocalStorage() {
    if (localStorage.getItem(LS_MIGRATED) === 'true') return;
    const oldItems = loadFromLocalStorage();
    const current = await getAllItems();
    if (current.length === 0 && oldItems.length > 0) {
        for (const item of oldItems) {
            await addItem(item);
        }
        localStorage.setItem(LS_MIGRATED, 'true');
        console.log(`Міграція: перенесено ${oldItems.length} рецептів з localStorage в IndexedDB`);
    }
}

// Крок 11: якщо IndexedDB недоступна (наприклад, приватний режим), працюємо через localStorage
let idbAvailable = true;

async function getSavedRecipes() {
    return idbAvailable ? getAllItems() : loadFromLocalStorage();
}

async function putSavedRecipe(recipe) {
    if (idbAvailable) return addItem(recipe);
    // Крок 3: у режимі localStorage зберігаємо після кожної зміни
    const items = loadFromLocalStorage().filter(item => item.id !== recipe.id);
    items.push(recipe);
    saveToLocalStorage(items);
}

async function removeSavedRecipe(id) {
    if (idbAvailable) return deleteItem(id);
    saveToLocalStorage(loadFromLocalStorage().filter(item => item.id !== id));
}

const savedList = document.querySelector('#saved-list');
const savedCount = document.querySelector('#saved-count');
const savedError = document.querySelector('#saved-error');

// Ідентифікатори вже збережених рецептів (для блокування кнопки «Зберегти рецепт»)
let savedIds = new Set();

function showSavedError(message) {
    savedError.textContent = message;
    savedError.hidden = !message;
}

// Позначає на картках з API кнопки тих рецептів, які вже збережено
function markSavedButtons() {
    document.querySelectorAll('#api-list [data-save-id]').forEach(btn => {
        const saved = savedIds.has(btn.dataset.saveId);
        btn.disabled = saved;
        btn.textContent = saved ? 'Збережено' : 'Зберегти рецепт';
    });
}

// Крок 9: рендер збережених рецептів із даних сховища
function renderSaved(items) {
    savedList.innerHTML = '';
    savedCount.textContent = `Збережено рецептів: ${items.length}`;

    if (items.length === 0) {
        savedList.append(createEl('p', 'Збережених рецептів ще немає. Натисніть «Зберегти рецепт» на картці вище.', 'empty-message'));
        return;
    }

    items.forEach(item => {
        const card = createEl('article', '', 'recipe-card');
        if (item.img) {
            const img = document.createElement('img');
            img.src = item.img;
            img.setAttribute('alt', `Напій ${item.name}`);
            card.append(img);
        }
        const content = createEl('div', '', 'card-content');
        content.append(createEl('h3', item.name));

        const list = createEl('ul', '', 'ingredients');
        item.ingredients.forEach(text => list.append(createEl('li', text)));
        content.append(createEl('p', 'Інгредієнти:', 'drink-type'), list);
        content.append(createEl('p', item.instructions));

        const delBtn = createEl('button', 'Видалити', 'btn', 'btn-secondary');
        delBtn.type = 'button';
        delBtn.addEventListener('click', () => deleteSavedRecipe(item.id));
        content.append(delBtn);

        card.append(content);
        savedList.append(card);
    });
}

// Оновлює список на екрані з даних сховища після кожної CRUD-операції
async function refreshSaved() {
    try {
        const items = await getSavedRecipes();
        savedIds = new Set(items.map(item => item.id));
        renderSaved(items);
        markSavedButtons();
    } catch (error) {
        console.error(error);
        showSavedError('Не вдалося прочитати збережені рецепти.');
    }
}

// Кнопка «Зберегти рецепт»: записує рецепт у сховище (лише поля моделі)
async function saveRecipe(recipe) {
    try {
        await putSavedRecipe({
            id: recipe.id,
            name: recipe.name,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            img: recipe.img
        });
        showSavedError('');
        await refreshSaved();
    } catch (error) {
        console.error(error);
        showSavedError('Не вдалося зберегти рецепт.');
    }
}

async function deleteSavedRecipe(id) {
    try {
        await removeSavedRecipe(id);
        showSavedError('');
        await refreshSaved();
    } catch (error) {
        console.error(error);
        showSavedError('Не вдалося видалити рецепт.');
    }
}

// Ініціалізація сховища: відкриття бази, міграція, перше відображення
async function initStorage() {
    try {
        await openDB();
        await migrateFromLocalStorage();
    } catch (error) {
        // Крок 11: зрозуміле повідомлення для користувача, технічні деталі — у консоль
        idbAvailable = false;
        console.error('IndexedDB недоступна:', error);
        showSavedError('IndexedDB недоступна (можливо, приватний режим). Рецепти зберігаються в localStorage.');
    }
    await refreshSaved();
}

initStorage();
