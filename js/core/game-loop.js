import * as GameState from './game-state.js';
import * as Input from './input.js';
import * as Graphics from './graphics.js';
import * as Particles from './particles.js';
import * as Defense from '../game-modes/defense-mode.js';
import * as TD from '../game-modes/td-mode.js';
import * as Jump from '../game-modes/jump-mode.js';
import * as Boss from '../game-modes/boss-mode.js';
import * as UI from '../ui/menu.js';
import * as Storage from '../utils/storage.js';

export function init() {
    GameState.loopId = requestAnimationFrame(loop);
}

export function startGame(m) {
    GameState.mode = m;
    GameState.state = 'play';
    
    document.querySelectorAll('.menu-panel').forEach(e => e.classList.add('hidden'));
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('ui-layer').style.pointerEvents = 'none';
    
    Input.input.attack = false;
    Input.input.skill = false;
    
    if (m === 'td') {
        document.getElementById('action-buttons').style.pointerEvents = 'none';
        document.getElementById('td-ui').classList.remove('hidden');
    } else {
        document.getElementById('action-buttons').style.pointerEvents = 'auto';
    }
    
    document.getElementById('boss-bar-container').style.display='none';

    if(GameState.controlType==='mobile') {
        if(m === 'td') document.getElementById('mobile-controls').classList.add('hidden');
        else document.getElementById('mobile-controls').classList.remove('hidden');
    }

    if(m==='td') { 
        document.getElementById('td-ui').classList.remove('hidden'); 
        TD.init(); 
    }
    else if(m==='jump') { 
        Jump.init(); 
    }
    else if(m==='boss') { 
        Boss.init(); 
    }
    else Defense.init();
    
    cancelAnimationFrame(GameState.loopId); 
    loop();
}

export function endGame(win, reward) {
    GameState.state='over';
    Storage.saveGame();
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('mobile-controls').classList.add('hidden');
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('ui-layer').style.pointerEvents = 'auto';
    
    const t = document.getElementById('go-title'), m = document.getElementById('go-msg');
    if(win) { 
        t.innerText = "ПОБЕДА"; 
        t.style.color="#00bfff"; 
        m.innerText = `Награда: ${reward} ★`; 
        GameState.stars += reward; 
        GameState.updateStars(); 
    } 
    else { 
        t.innerText = "ПОРАЖЕНИЕ"; 
        t.style.color="#ff0055"; 
        m.innerText = reward > 0 ? `Собрано: ${reward} ★` : "Система уничтожена"; 
        if(reward > 0) { 
            GameState.stars += reward; 
            GameState.updateStars(); 
        } 
    }
}

export function returnToMenu() { 
    document.getElementById('game-over').classList.add('hidden'); 
    document.getElementById('main-menu').classList.remove('hidden'); 
}

function loop() {
    if(GameState.state!=='play') return;
    
    Graphics.ctx.clearRect(0,0,GameState.W,GameState.H);
    Input.updatePCInput();
    
    if(GameState.mode==='defense') { 
        Defense.update(); 
        Defense.draw(); 
    }
    else if(GameState.mode==='td') { 
        TD.update(); 
        TD.draw(); 
    }
    else if(GameState.mode==='jump') { 
        Jump.update(); 
        Jump.draw(); 
    }
    else if(GameState.mode==='boss') { 
        Boss.update(); 
        Boss.draw(); 
    }
    
    Particles.updateParticles();
    Particles.drawParticles();
    
    GameState.loopId = requestAnimationFrame(loop);
}