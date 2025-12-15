import * as GameState from './core/game-state.js';
import * as Input from './core/input.js';
import * as Graphics from './core/graphics.js';
import * as Particles from './core/particles.js';
import * as UI from './ui/menu.js';
import * as Game from './core/game-loop.js';
import * as Storage from './utils/storage.js';
import * as TD from './game-modes/td-mode.js';

// Делаем модули доступными глобально
window.GameState = GameState;
window.UI = UI;
window.Game = Game;
window.Storage = Storage;
window.TD = TD;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    GameState.init();
    Input.init();
    UI.init();
    Game.init();
});