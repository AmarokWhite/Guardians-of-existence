import * as GameState from '../core/game-state.js';

export function renderAchievements() {
    const l = document.getElementById('ach-list'); 
    l.innerHTML='';
    
    GameState.achievements.forEach(a => { 
        l.innerHTML += `
            <div style="padding:15px; border-bottom:1px solid #333; display:flex; justify-content:space-between; color:${a.done?'#00bfff':'#777'}">
                <div>
                    <b style="font-size:16px">${a.name}</b><br>
                    <small>${a.desc}</small>
                </div>
                <div>${a.done?'✔':a.reward+'★'}</div>
            </div>
        `; 
    });
}