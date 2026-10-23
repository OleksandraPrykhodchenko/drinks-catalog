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

    // Якщо за фільтром нічого не знайдено — показуємо повідомлення
    if (recipes.length === 0) {
        listContainer.append(createEl('p', 'Рецептів за обраним фільтром немає.', 'empty-message'));
    }

    recipes.forEach(recipe => {
        const card = createEl('article', '', 'recipe-card');
        card.dataset.time = recipe.timeMinutes;

        // Нові рецепти з форми не мають зображення — тоді img не створюємо
        const img = recipe.img ? document.createElement('img') : null;
        if (img) {
            img.src = recipe.img;
            img.setAttribute('alt', recipe.imgAlt);
        }

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
        if (img) card.append(img);
        card.append(content);

        // Умовний клас: безалкогольний напій
        if (!recipe.alcohol) {
            card.classList.add('non-alcoholic');
        }

        listContainer.append(card);
    });

    // Оновлення підсумку: кількість безалкогольних рецептів (серед усіх даних, а не лише показаних)
    const nonAlcoholicCount = drinksRecipes.filter(recipe => !recipe.alcohol).length;
    drinksCount.textContent = `Безалкогольних рецептів: ${nonAlcoholicCount}. Показано: ${recipes.length} з ${drinksRecipes.length}`;
}

// Крок 2: вибір форми та її полів
const form = document.querySelector('#add-recipe-form');
const nameInput = document.querySelector('#recipe-name');
const typeSelect = document.querySelector('#recipe-type');
const timeInput = document.querySelector('#recipe-time');
const alcoholCheckbox = document.querySelector('#recipe-alcohol');
const onlyNonAlcCheckbox = document.querySelector('#only-non-alcoholic');

// Перемальовує список з урахуванням чекбокса-фільтра «лише безалкогольні»
function renderFiltered() {
    const list = onlyNonAlcCheckbox.checked
        ? drinksRecipes.filter(recipe => !recipe.alcohol)
        : drinksRecipes;
    renderDrinks(list);
}

// Складність нового рецепта визначаємо за часом приготування (у формі такого поля немає)
const getDifficulty = time => (time <= 10 ? 'Легко' : time <= 20 ? 'Середньо' : 'Складно');

// Крок 8: додаткова валідація на подію input — час приготування має бути більшим за нуль
timeInput.addEventListener('input', () => {
    if (timeInput.value !== '' && Number(timeInput.value) <= 0) {
        timeInput.setCustomValidity('Час приготування має бути більшим за нуль');
    } else {
        timeInput.setCustomValidity(''); // повернути стандартний коректний стан
    }
});

// Назва з самих пробілів проходить required, тому перевіряємо її окремо
nameInput.addEventListener('input', () => {
    if (nameInput.value !== '' && nameInput.value.trim() === '') {
        nameInput.setCustomValidity('Назва не може складатися лише з пробілів');
    } else {
        nameInput.setCustomValidity('');
    }
});

// Кроки 3-7: обробка надсилання форми без перезавантаження сторінки
form.addEventListener('submit', event => {
    event.preventDefault(); // без цього сторінка перезавантажиться

    // Крок 4: зчитування значень полів
    const name = nameInput.value.trim();
    const type = typeSelect.value;
    const timeMinutes = Number(timeInput.value);
    const alcohol = alcoholCheckbox.checked;

    // Крок 5: новий об'єкт тієї самої форми, що й елементи масиву, і додавання через push
    drinksRecipes.push({
        name,
        type,
        alcohol,
        timeMinutes,
        difficulty: getDifficulty(timeMinutes),
        description: 'Рецепт додано користувачем.'
    });

    // Крок 6: повторний виклик рендеру з оновленим масивом
    renderFiltered();

    // Крок 7: очищення форми
    form.reset();
    console.log(`Додано рецепт: ${name}. Усього рецептів: ${drinksRecipes.length}`);
});

// Крок 9: друга подія варіанта — change на чекбоксі «лише безалкогольні»
onlyNonAlcCheckbox.addEventListener('change', renderFiltered);

// Форма фільтра не має надсилатися (Enter у select не повинен перезавантажувати сторінку)
document.querySelector('#filter form').addEventListener('submit', event => event.preventDefault());

// Початкове відображення списку
renderFiltered();