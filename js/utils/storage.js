import * as GameState from '../core/game-state.js';

export function saveGame() {
    const data = {
        stars: GameState.stars,
        chars: GameState.chars.map(c => ({ 
            id: c.id, 
            skins: c.skins, 
            selectedSkin: c.selectedSkin 
        })),
        ach: GameState.achievements.map(a => ({
            id: a.id, 
            done: a.done
        }))
    };
    
    localStorage.setItem('goe_v13_cosmic_save', JSON.stringify(data));
}

export function loadGame() {
    const raw = localStorage.getItem('goe_v13_cosmic_save');
    if(raw) {
        try {
            const data = JSON.parse(raw);
            if(data.stars !== undefined) GameState.stars = data.stars;
            if(data.chars) {
                data.chars.forEach(savedC => {
                    let realC = GameState.chars.find(x => x.id === savedC.id);
                    if(realC) {
                        if(savedC.skins) realC.skins = savedC.skins;
                        if(savedC.selectedSkin !== undefined) realC.selectedSkin = savedC.selectedSkin;
                    }
                });
            }
            if(data.ach) {
                data.ach.forEach(s => { 
                    let a = GameState.achievements.find(x => x.id === s.id); 
                    if(a) a.done = s.done; 
                });
            }
        } catch(e) { 
            console.error("Save Error", e); 
        }
    }
    GameState.updateStars();
}