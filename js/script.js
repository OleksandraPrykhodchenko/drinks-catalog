console.log('script.js підключено');

// Оголошення даних (масив об'єктів для варіанта 15)
const drinksRecipes = [
    { name: 'Кава Латте', type: 'Гарячий', alcohol: false, timeMinutes: 15, difficulty: 'Легко', description: 'Класичний кавовий напій з великою кількістю молока.', img: 'assets/img/latte.jpg', imgAlt: 'Склянка гарячого латте' },
    { name: 'Мохіто', type: 'Холодний', alcohol: true, timeMinutes: 10, difficulty: 'Середньо', description: 'Освіжаючий напій на основі білого рому, м\'яти та лайма.', img: 'assets/img/mojito.jpg', imgAlt: 'Холодний коктейль мохіто з м\'ятою та лаймом' },
    { name: 'Домашній Лимонад', type: 'Холодний', alcohol: false, timeMinutes: 20, difficulty: 'Легко', description: 'Прохолодний літній напій зі свіжих лимонів та сиропу.', img: 'assets/img/lemonade.jpg', imgAlt: 'Глек свіжого лимонаду з льодом та м\'ятою' },
    { name: 'Глінтвейн', type: 'Гарячий', alcohol: true, timeMinutes: 25, difficulty: 'Легко', description: 'Зігріваючий напій на основі червоного вина зі спеціями та цитрусовими.', img: 'assets/img/glintveine.jpg', imgAlt: 'Келих гарячого глінтвейну зі спеціями' },
    { name: 'Швидкий Експрес-чай', type: 'Гарячий', alcohol: false, timeMinutes: 3, difficulty: 'Легко', description: 'Швидкий гарячий напій з листового чаю та скибочки лимона.', img: 'assets/img/tea.jpg', imgAlt: 'Чашка гарячого чаю' }
];

// Крок 2: програмне видалення статичних карток-заглушок з практикуму 2
document.querySelectorAll('#drinks-list .recipe-card').forEach(card => card.remove());

// Крок 3: вибір контейнера списку та елемента-підсумку
const listContainer = document.querySelector('#drinks-list');
const drinksCount = document.querySelector('#drinks-count');

// Функція перевіряє, чи готується напій 5 хвилин або швидше
const isQuick = time => time <= 5;

// Допоміжна функція: створює елемент із тегом, текстом та (за потреби) класами
function createEl(tag, text, ...classes) {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (classes.length) el.classList.add(...classes);
    return el;
}

// Функція рендеру: очищає контейнер і створює картку для кожного рецепта з масиву.
// Картка містить зображення, бейджі (тип і наявність алкоголю), назву, час/складність,
// тип та опис. Для безалкогольних напоїв додає клас non-alcoholic, оновлює підсумковий лічильник.
function renderDrinks(recipes) {
    listContainer.innerHTML = '';

    recipes.forEach(recipe => {
        const card = createEl('article', '', 'recipe-card');
        card.dataset.time = recipe.timeMinutes;

        const img = document.createElement('img');
        img.src = recipe.img;
        img.setAttribute('alt', recipe.imgAlt);

        const content = createEl('div', '', 'card-content');

        // Бейджі: гарячий/холодний та алкогольний/безалкогольний
        const badges = createEl('div', '', 'badges');
        const typeClass = recipe.type === 'Гарячий' ? 'badge-hot' : 'badge-cold';
        badges.append(
            createEl('span', recipe.type, 'badge', typeClass),
            recipe.alcohol
                ? createEl('span', 'Алкогольний', 'badge', 'badge-alc')
                : createEl('span', 'Безалкогольний', 'badge', 'badge-non-alc')
        );

        const title = createEl('h3', recipe.name);

        // Рядок з часом приготування та складністю
        const meta = createEl('div', '', 'recipe-meta');
        meta.append(
            createEl('span', `⏱ ${recipe.timeMinutes} хв`),
            createEl('span', `📊 ${recipe.difficulty}`)
        );
        if (isQuick(recipe.timeMinutes)) {
            meta.append(createEl('span', '⚡ Швидко'));
        }

        const type = createEl('p', `Тип: ${recipe.type}`, 'drink-type');
        const description = createEl('p', recipe.description);

        content.append(badges, title, meta, type, description);
        card.append(img, content);

        // Умовний клас: безалкогольний напій
        if (!recipe.alcohol) {
            card.classList.add('non-alcoholic');
        }

        listContainer.append(card);
    });

    // Оновлення підсумку: кількість безалкогольних рецептів
    const nonAlcoholicCount = recipes.filter(recipe => !recipe.alcohol).length;
    drinksCount.textContent = `Безалкогольних рецептів: ${nonAlcoholicCount}`;
}

renderDrinks(drinksRecipes);