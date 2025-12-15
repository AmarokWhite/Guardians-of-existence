import * as GameState from '../core/game-state.js';
import * as Graphics from '../core/graphics.js';
import * as Particles from '../core/particles.js';
import * as Game from '../core/game-loop.js';
import * as Input from '../core/input.js';
import { TOWER_DATA } from '../core/constants.js';

let towers = [], enemies = [], wave = 1, hp = 100, cash = 500, path = [], selTow = -1, selChar = 0;

export function init() {
    wave=1; hp=100; cash=400; towers=[]; enemies=[]; path=[];
    for(let i=0; i<=12; i++) path.push({x: (GameState.W/12)*i, y: GameState.H/2 + Math.sin(i)*180});
    renderSlots();
}

export function handleTDClick() {
    let mx = Input.input.mouse.x, my = Input.input.mouse.y, clicked = -1;
    towers.forEach((t,i) => { if(Math.hypot(t.x-mx, t.y-my)<30) clicked=i; });
    if(clicked !== -1) {
        selTow = clicked;
        const p = document.getElementById('upgrade-panel'); p.style.display='block';
        let t = towers[clicked];
        document.getElementById('upg-info').innerText = `${t.name} (Ур ${t.level})`;
        document.getElementById('upg-cost').innerText = Math.floor(TOWER_DATA[t.type].cost * (t.level+1));
    } else {
        deselectTower();
        const stats = TOWER_DATA[selChar];
        if(cash >= stats.cost) {
             let valid = true;
             path.forEach(p=>{if(Math.hypot(p.x-mx, p.y-my)<40) valid=false});
             towers.forEach(t=>{if(Math.hypot(t.x-mx, t.y-my)<50) valid=false});
             if(valid && mx > 0 && mx < GameState.W && my > 0 && my < GameState.H-100) {
                 const c = GameState.chars[selChar];
                 towers.push({ x:mx, y:my, type:selChar, range: stats.range, dmg: stats.dmg, cd:0, maxCd: stats.cd, color: c.color, level:1, effect: stats.effect, skin: c.selectedSkin, name: stats.name });
                 cash -= stats.cost; renderSlots();
             }
        }
    }
}

export function upgradeSelectedTower() {
    if(selTow===-1) return;
    let t = towers[selTow];
    let cost = Math.floor(TOWER_DATA[t.type].cost * (t.level+1));
    if(cash>=cost) { 
        cash-=cost; t.level++; t.dmg = Math.floor(t.dmg*1.3); t.range+=10;
        renderSlots(); 
        document.getElementById('upg-info').innerText = `${t.name} (Ур ${t.level})`;
        document.getElementById('upg-cost').innerText = Math.floor(TOWER_DATA[t.type].cost * (t.level+1));
    }
}

export function deselectTower() { selTow=-1; document.getElementById('upgrade-panel').style.display='none'; }

function renderSlots() {
    const ui = document.getElementById('td-ui'); ui.innerHTML = `<div style="color:#ffd700;font-weight:900;margin-right:10px; font-size:16px; align-self:center;">${cash}$</div>`;
    GameState.chars.forEach((c, i) => {
        const stats = TOWER_DATA[i];
        let d = document.createElement('div'); 
        d.style.cssText = `min-width:60px; height:80px; border:1px solid #333; margin-right:5px; background:rgba(0,0,0,0.5); border-radius:6px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; ${i===selChar?'border-color:#00bfff; background:rgba(0,191,255,0.2);':''}`;
        d.innerHTML = `<div style="font-size:9px; color:#fff">${c.name}</div><div style="color:#ffd700; font-size:12px;">$${stats.cost}</div>`;
        d.onclick = (e) => { e.stopPropagation(); selChar = i; renderSlots(); deselectTower(); };
        ui.appendChild(d);
    });
}

export function update() {
    if(enemies.length===0 && Math.random()<0.02) enemies.push({idx:0, x:path[0].x, y:path[0].y, hp:50+wave*30, maxHp:50+wave*30, spd:2+wave*0.1, r:10, slow:0});
    if(enemies.length===0 && Math.random()<0.005) { wave++; cash+=100; renderSlots(); }
    
    towers.forEach(t => {
        if(t.cd>0) t.cd--;
        if(t.cd<=0) {
            let target = null;
            let maxIdx = -1;
            enemies.forEach(e => { 
                if(Math.hypot(e.x-t.x, e.y-t.y)<=t.range && e.idx > maxIdx) { maxIdx = e.idx; target = e; } 
            });

            if(target) { 
                t.cd=t.maxCd; 
                target.hp-=t.dmg; 
                if(t.effect === 'slow') target.slow = 40;
                if(t.effect === 'splash') enemies.forEach(e => { if(Math.hypot(e.x-target.x, e.y-target.y)<60) e.hp-=t.dmg*0.5; });
                Particles.spawnParticle(t.x, t.y, t.color, 4, 4, 10);
                t.fireLine = {x: target.x, y: target.y, life: 5};
            }
        }
    });

    for(let i=enemies.length-1; i>=0; i--) {
        let e = enemies[i], next = path[e.idx+1];
        if(!next) { hp-=10; enemies.splice(i,1); continue; }
        
        let s = e.slow > 0 ? e.spd*0.5 : e.spd;
        if(e.slow>0) e.slow--;
        
        let d = Math.hypot(next.x-e.x, next.y-e.y);
        if(d<5) e.idx++; else { e.x+=(next.x-e.x)/d*s; e.y+=(next.y-e.y)/d*s; }
        if(e.hp<=0) { enemies.splice(i,1); cash+=10; renderSlots(); }
    }
    
    document.getElementById('stat-1').innerText = `ЯДРО: ${hp}`;
    document.getElementById('stat-2').innerText = `ВОЛНА: ${wave}`;
    if(hp<=0) Game.endGame(false, 0);
    if(wave>20) { GameState.checkAchievement('keeper'); Game.endGame(true, 100); }
}

export function draw() {
    Graphics.drawBackground('td');
    
    Graphics.ctx.strokeStyle = '#333'; Graphics.ctx.lineWidth = 20; Graphics.ctx.lineCap='round';
    Graphics.ctx.beginPath(); Graphics.ctx.moveTo(path[0].x, path[0].y); path.forEach(p=>Graphics.ctx.lineTo(p.x, p.y)); Graphics.ctx.stroke();
    Graphics.ctx.strokeStyle = '#00bfff'; Graphics.ctx.lineWidth = 2;
    Graphics.ctx.stroke();

    towers.forEach((t, i) => {
        if(i===selTow) { Graphics.ctx.strokeStyle='rgba(255,255,255,0.5)'; Graphics.ctx.beginPath(); Graphics.ctx.arc(t.x, t.y, t.range, 0, Math.PI*2); Graphics.ctx.stroke(); }
        Graphics.drawShape(Graphics.ctx, t.type, t.x, t.y, 14, t.color, t.skin);
        if(t.fireLine && t.fireLine.life>0) {
            Graphics.ctx.strokeStyle = t.color; Graphics.ctx.lineWidth = 2; 
            Graphics.ctx.beginPath(); Graphics.ctx.moveTo(t.x, t.y); Graphics.ctx.lineTo(t.fireLine.x, t.fireLine.y); Graphics.ctx.stroke();
            t.fireLine.life--;
        }
    });
    
    enemies.forEach(e => {
        Graphics.ctx.fillStyle=e.slow>0 ? '#0ff' : '#f00'; 
        Graphics.ctx.beginPath(); Graphics.ctx.arc(e.x, e.y, e.r, 0, Math.PI*2); Graphics.ctx.fill();
        Graphics.ctx.fillStyle='#0f0'; Graphics.ctx.fillRect(e.x-10, e.y-15, 20*(e.hp/e.maxHp), 3);
    });
}