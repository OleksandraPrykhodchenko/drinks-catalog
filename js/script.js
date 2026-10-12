console.log('script.js підключено');

// Оголошення даних (масив об'єктів для варіанта 15)
const drinksRecipes = [
    { name: 'Кава Латте', alcohol: false, timeMinutes: 15 },
    { name: 'Мохіто', alcohol: true, timeMinutes: 10 },
    { name: 'Домашній Лимонад', alcohol: false, timeMinutes: 20 },
    { name: 'Глінтвейн', alcohol: true, timeMinutes: 25 },
    { name: 'Швидкий Експрес-чай', alcohol: false, timeMinutes: 3 }
];

// Функція проходить масив циклом і виводить лише безалкогольні рецепти
function showNonAlcoholicDrinks(recipes) {
    console.log('--- Безалкогольні рецепти ---');
    for (const recipe of recipes) {
        // Умова: if перевіряє поле alcohol
        if (recipe.alcohol === false) {
            console.log(`Напій: ${recipe.name} | Час приготування: ${recipe.timeMinutes} хв`);
        }
    }
}

showNonAlcoholicDrinks(drinksRecipes);

// Функція перевіряє, чи готується напій 5 хвилин або швидше
const isQuick = time => time <= 5;

// Перевірка роботи стрілкової функції на реальних даних
console.log('--- Перевірка рецептів на швидкість (<= 5 хв) ---');
for (const recipe of drinksRecipes) {
    const quickStatus = isQuick(recipe.timeMinutes) ? 'Так' : 'Ні';
    console.log(`Чи швидкий напій "${recipe.name}" (${recipe.timeMinutes} хв)? - ${quickStatus}`);
}