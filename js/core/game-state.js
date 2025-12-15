import * as Storage from '../utils/storage.js';

export let W, H, GW, viewX = 0;
export let state = 'start';
export let controlType = 'pc';
export let mode = null;
export let stars = 150;
export let selectedCharId = 0;
export let loopId = null;

export const chars = [
    { 
        id: 0, name: "АЛЕКС", title: "Солнечный Авангард", color: "#ff8c00", 
        lore: "Бывший капитан звёздного флота, чья броня впитала энергию умирающей звезды. Теперь он — живое оружие ближнего боя, сжигающее врагов в пепел одним касанием.", 
        desc: "Тип: БЛИЖНИЙ БОЙ. Наносит огромный урон врагам в упор. Имеет повышенное здоровье.", 
        skins: [{name: "Стандарт (Оранж)", unlocked: true}, {name: "Квантовый Клинок (Фиолет)", unlocked: false, cost: 100}],
        selectedSkin: 0, unlocked: true 
    },
    { 
        id: 1, name: "АМАРОК", title: "Ткач Времени", color: "#00bfff", 
        lore: "Сущность, существующая вне потока времени. Амарок видит все варианты будущего и выбирает тот, где его враги уже мертвы.", 
        desc: "Тип: СКОРОСТРЕЛ. Стреляет быстрыми иглами времени. Умеет замораживать врагов.", 
        skins: [{name: "Стандарт (Голубой)", unlocked: true}, {name: "Золотой Хронос (Золото)", unlocked: false, cost: 100}],
        selectedSkin: 0, unlocked: true 
    },
    { 
        id: 2, name: "НОКС", title: "Адепт Пустоты", color: "#9b59b6", 
        lore: "Рожденный в черной дыре, Нокс не признает законов физики. Материальные препятствия для него — лишь иллюзия.", 
        desc: "Тип: МАГ. Снаряды проходят сквозь стены и наносят чистый урон.", 
        skins: [{name: "Стандарт (Пурпур)", unlocked: true}, {name: "Сингулярность (Черный)", unlocked: false, cost: 100}],
        selectedSkin: 0, unlocked: true 
    },
    { 
        id: 3, name: "МИРАЙ", title: "Дух Возмездия", color: "#ff4444", 
        lore: "Кибер-жрица, объединившая технологии древних с экзорцизмом. Ее духи находят цель даже на другом конце галактики.", 
        desc: "Тип: САМОНАВОДКА. Выпускает духов, которые сами ищут врагов.", 
        skins: [{name: "Стандарт (Красный)", unlocked: true}, {name: "Призрак Они (Кровь)", unlocked: false, cost: 100}],
        selectedSkin: 0, unlocked: true 
    },
    { 
        id: 4, name: "ХАРЛИ", title: "Серый Кардинал", color: "#bdc3c7", 
        lore: "Тактический гений, использующий запрещенные протоколы ведения войны. Его выстрелы всегда находят уязвимые точки брони.", 
        desc: "Тип: СНАЙПЕР. Медленная перезарядка, но критический урон.", 
        skins: [{name: "Стандарт (Сталь)", unlocked: true}, {name: "Император (Белый)", unlocked: false, cost: 100}],
        selectedSkin: 0, unlocked: true 
    },
    { 
        id: 5, name: "ГЛИТЧ", title: "Ошибка [REDACTED]", color: "#00fa9a", 
        lore: "Живая аномалия кода вселенной. Никто не знает, откуда он пришел, но после него остается только бинарный шум.", 
        desc: "Тип: ХАОС. Атакует 'Бинарным Штурмом' — три хаотичных снаряда сразу.", 
        skins: [{name: "Стандарт (Зеленый)", unlocked: true}, {name: "Матрица (Код)", unlocked: false, cost: 100}],
        selectedSkin: 0, unlocked: true 
    }
];

export const achievements = [
    { id: 'first_blood', name: 'Первая Кровь', desc: 'Убить 1 врага', done: false, reward: 10 },
    { id: 'defender', name: 'Страж Галактики', desc: 'Пройти Защиту Миров', done: false, reward: 50 },
    { id: 'keeper', name: 'Властелин Времени', desc: 'Пройти Парадокс Времени', done: false, reward: 100 },
    { id: 'jumper', name: 'Горизонт Событий', desc: 'Собрать 25 сингулярностей', done: false, reward: 50 },
    { id: 'boss_killer', name: 'Убийца Богов', desc: 'Победить Босса', done: false, reward: 200 },
    { id: 'richman', name: 'Космический Магнат', desc: 'Накопить 300 звезд', done: false, reward: 50 },
    { id: 'fashion', name: 'Икона Стиля', desc: 'Купить 1 скин', done: false, reward: 30 }
];

export function init() {
    resize();
    window.addEventListener('resize', resize);
    Storage.loadGame();
}

export function resize() {
    const cvs = document.getElementById('gameCanvas');
    W = cvs.width = window.innerWidth;
    H = cvs.height = window.innerHeight;
}

export function setControl(type) {
    controlType = type;
    document.getElementById('start-screen').classList.add('hidden');
    Storage.loadGame(); 
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('currency-display').classList.remove('hidden');
}

export function updateStars() { 
    document.getElementById('stars-val').innerText = stars; 
    if(stars >= 300) checkAchievement('richman');
}

export function checkAchievement(id) {
    const a = achievements.find(x => x.id === id);
    if(a && !a.done) {
        a.done = true;
        stars += a.reward;
        updateStars();
        Storage.saveGame();
        alert(`ТРОФЕЙ: ${a.name}`);
    }
}

// Экспорт всех переменных и функций
export default {
    W, H, GW, viewX,
    state, controlType, mode, stars, selectedCharId, loopId,
    chars, achievements,
    init, resize, setControl, updateStars, checkAchievement
};