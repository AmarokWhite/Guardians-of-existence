import * as GameState from '../core/game-state.js';
import * as Input from '../core/input.js';
import * as Graphics from '../core/graphics.js';
import * as Particles from '../core/particles.js';
import * as Game from '../core/game-loop.js';

let platforms = [], items = [], score = 0;
let player = { x: 0, y: 0, r: 15, vx: 0, vy: 0 };
let cameraY = 0, maxH = 0;

export function init() {
    if(GameState.controlType === 'pc') { 
        GameState.GW = 600; 
        GameState.viewX = (GameState.W - GameState.GW)/2; 
    } else { 
        GameState.GW = GameState.W; 
        GameState.viewX = 0; 
    }
    
    const c = GameState.chars[GameState.selectedCharId];
    player = { 
        x: GameState.GW/2, 
        y: GameState.H - 150, 
        r: 15, 
        vx: 0, 
        vy: -10, 
        color: c.color, 
        type: c.id, 
        skin: c.selectedSkin 
    };
    
    platforms = []; 
    items = []; 
    score = 0; 
    cameraY = 0; 
    maxH = 0;
    
    platforms.push({x: GameState.GW/2 - 50, y: GameState.H - 50, w: 100, h: 20});
    generatePlatforms(GameState.H);
    
    document.getElementById('action-buttons').classList.add('hidden');
    if(GameState.controlType === 'mobile') {
        document.getElementById('mobile-controls').classList.remove('hidden');
    }
}

function generatePlatforms(targetH) {
    while (maxH < targetH + GameState.H) {
        maxH += 80 + Math.random() * 50; 
        let w = 70 + Math.random() * 60;
        let x = Math.random() * (GameState.GW - w);
        let y = GameState.H - maxH;
        let type = Math.random() < 0.1 ? 1 : 0;
        platforms.push({x, y, w, h: 15, type});
        if (Math.random() < 0.3) {
            items.push({x: x + w/2, y: y - 25, r: 8, taken: false});
        }
    }
}

export function update() {
    player.vy += 0.5;
    player.vx = Input.input.x * 8; 
    player.x += player.vx;
    player.y += player.vy;
    
    if (player.x < 0) player.x = GameState.GW;
    if (player.x > GameState.GW) player.x = 0;

    if (player.vy > 0) {
        platforms.forEach(p => {
            if (player.x + 10 > p.x && player.x - 10 < p.x + p.w &&
                player.y + player.r > p.y && player.y + player.r < p.y + p.h + 20) {
                player.vy = p.type===1 ? -22 : -14;
                Particles.spawnParticle(player.x, p.y, '#fff', 5, 2, 5);
            }
        });
    }

    items.forEach(s => {
        if (!s.taken && Math.hypot(s.x - player.x, s.y - player.y) < s.r + player.r) {
            s.taken = true; 
            score++; 
            Particles.spawnParticle(s.x, s.y, '#ffd700', 10, 3, 10);
            if (score >= 25) { 
                GameState.checkAchievement('jumper'); 
                Game.endGame(true, 50); 
            }
        }
    });

    let screenY = player.y + cameraY;
    if (screenY < GameState.H * 0.45) {
        let diff = GameState.H * 0.45 - screenY; 
        cameraY += diff;
        generatePlatforms(maxH + diff);
    }
    
    if (screenY > GameState.H + 50) Game.endGame(false, Math.floor(score));
    
    document.getElementById('stat-1').innerText = `СИНГУЛЯРНОСТИ: ${score}/25`;
    document.getElementById('stat-2').innerText = "";
}

export function draw() {
    Graphics.drawBackground('jump');
    Graphics.ctx.save();
    if(GameState.controlType === 'pc') Graphics.ctx.translate(GameState.viewX, 0);

    platforms.forEach(p => {
        let py = p.y + cameraY;
        if (py > -50 && py < GameState.H + 50) {
            Graphics.ctx.fillStyle = p.type===1 ? '#e74c3c' : '#8e44ad';
            Graphics.ctx.shadowBlur = 10; 
            Graphics.ctx.shadowColor = Graphics.ctx.fillStyle;
            Graphics.ctx.fillRect(p.x, py, p.w, p.h);
        }
    });
    
    items.forEach(s => {
        let sy = s.y + cameraY;
        if (!s.taken && sy > -50 && sy < GameState.H + 50) {
            Graphics.ctx.fillStyle = '#fff'; 
            Graphics.ctx.shadowBlur=15; 
            Graphics.ctx.shadowColor='#fff';
            Graphics.ctx.beginPath(); 
            Graphics.ctx.arc(s.x, sy, s.r, 0, Math.PI*2); 
            Graphics.ctx.fill();
        }
    });

    Graphics.drawShape(Graphics.ctx, player.type, player.x, player.y + cameraY, player.r, player.color, player.skin);
    Graphics.ctx.restore();
}