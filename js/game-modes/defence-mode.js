import * as GameState from '../core/game-state.js';
import * as Input from '../core/input.js';
import * as Graphics from '../core/graphics.js';
import * as Particles from '../core/particles.js';
import { TOWER_DATA } from '../core/constants.js';

let player, enemies, projs, wave, spawned;
let obstacles = [];

export function init() {
    const c = GameState.chars[GameState.selectedCharId];
    player = { 
        x: GameState.W/2, y: GameState.H/2, r: 20, speed: 6, hp: 120, maxHp: 120, 
        color: c.color, cd: 0, maxCd: 15, skillCd: 0, maxSkillCd: 300, 
        type: c.id, skin: c.selectedSkin 
    };
    
    if(c.id === 0) { player.maxHp = 200; player.speed = 7; player.maxCd = 25; }
    if(c.id === 1) { player.maxCd = 8; player.speed = 8; }
    if(c.id === 5) { player.maxCd = 20; }

    enemies = []; projs = []; wave = 1; spawned = 0; obstacles = [];
    
    for(let i=0; i<5; i++) {
        let w = 60 + Math.random()*80, h = 60 + Math.random()*80;
        let x = Math.random()*(GameState.W-w), y = Math.random()*(GameState.H-h);
        if(Math.hypot(x+w/2 - GameState.W/2, y+h/2 - GameState.H/2) > 250) obstacles.push({x, y, w, h});
    }
}

export function update() {
    let nextX = player.x + Input.input.x * player.speed;
    let nextY = player.y + Input.input.y * player.speed;
    
    let checkCol = (nx, ny) => {
        if(nx < player.r || nx > GameState.W-player.r || ny < player.r || ny > GameState.H-player.r) return true;
        return obstacles.some(o => nx > o.x - player.r && nx < o.x + o.w + player.r && ny > o.y - player.r && ny < o.y + o.h + player.r);
    };

    if(!checkCol(nextX, player.y)) player.x = nextX;
    if(!checkCol(player.x, nextY)) player.y = nextY;
    
    if(player.cd>0) player.cd--; if(player.skillCd>0) player.skillCd--;

    if(Input.input.attack && player.cd <= 0) {
        player.cd = player.maxCd;
        let angle = 0;
        
        if(GameState.controlType === 'pc') angle = Math.atan2(Input.input.mouse.y - player.y, Input.input.mouse.x - player.x);
        else {
            let near = enemies.reduce((p, c) => Math.hypot(c.x-player.x, c.y-player.y) < p.d ? {e:c, d:Math.hypot(c.x-player.x, c.y-player.y)} : p, {e:null, d:9999}).e;
            angle = near ? Math.atan2(near.y-player.y, near.x-player.x) : (Math.atan2(Input.input.y, Input.input.x)||0);
        }

        if (player.type === 0) { 
            Particles.spawnParticle(player.x + Math.cos(angle)*30, player.y + Math.sin(angle)*30, '#fff', 30, 2, 5);
            projs.push({ x: player.x + Math.cos(angle)*40, y: player.y + Math.sin(angle)*40, vx: 0, vy: 0, life: 3, size: 60, dmg: 50, color: 'rgba(255,140,0,0.5)', melee: true, angle: angle });
        } 
        else if (player.type === 5) {
            [-0.3, 0, 0.3].forEach(offset => {
                let a = angle + offset;
                projs.push({ x: player.x, y: player.y, vx: Math.cos(a)*14, vy: Math.sin(a)*14, life: 50, size: 4, dmg: 12, color: '#00fa9a' });
            });
        }
        else {
            let p = { x: player.x, y: player.y, color: player.color, life: 60 };
            p.vx = Math.cos(angle); p.vy = Math.sin(angle);
            
            if(player.type===1) { p.vx*=18; p.vy*=18; p.dmg=10; p.size=3; }
            else if(player.type===2) { p.vx*=10; p.vy*=10; p.dmg=25; p.size=6; p.spectral=true; }
            else if(player.type===3) { p.vx*=12; p.vy*=12; p.dmg=15; p.size=4; p.homing=true; }
            else if(player.type===4) { p.vx*=25; p.vy*=25; p.dmg=80; p.size=3; p.color='#fff'; }

            projs.push(p);
        }
    }

    if(Input.input.skill && player.skillCd <= 0) {
        player.skillCd = player.maxSkillCd;
        Particles.spawnParticle(player.x, player.y, player.color, 50, 5, 20);
        if(player.type===0) projs.push({x:player.x, y:player.y, vx:0, vy:0, life:10, size:150, color:'#ff8c00', dmg:100, melee:true});
        else if(player.type===1) enemies.forEach(e => e.freeze=200);
        else if(player.type===5) { projs = []; enemies.forEach(e => { e.hp-=40; Particles.spawnParticle(e.x, e.y, '#0f0', 10, 5, 10); }); }
        else if(player.type===4) enemies.forEach(e => { if(Math.hypot(e.x-player.x, e.y-player.y)<400) e.hp-=100; });
        else if(player.type===3) player.hp += 50; 
        else if(player.type===2) projs.push({x:player.x, y:player.y, vx:0, vy:0, life:100, size:60, color:'#9b59b6', dmg:2, area:true});
    }

    if(enemies.length < 5 + wave*2 && spawned < 10*wave && Math.random()<0.04) {
        let ex = Math.random()*GameState.W, ey = Math.random()*GameState.H;
        if(Math.hypot(ex-player.x, ey-player.y)>300) {
             enemies.push({x:ex, y:ey, r:15, hp:30+wave*10, speed:2+wave*0.2, color:'#ff0055', freeze:0});
             spawned++;
        }
    }

    enemies.forEach(e => {
        if(e.freeze>0) { e.freeze--; return; }
        let d = Math.hypot(player.x-e.x, player.y-e.y);
        if(d>0) { 
            let vx = (player.x-e.x)/d * e.speed, vy = (player.y-e.y)/d * e.speed;
            if(!checkCol(e.x+vx, e.y+vy)) { e.x+=vx; e.y+=vy; }
        }
        if(d < player.r+e.r) { player.hp-=0.5; }
    });

    for(let i=projs.length-1; i>=0; i--) {
        let p = projs[i];
        if(p.homing && enemies[0]) { 
            let t=enemies[0], a=Math.atan2(t.y-p.y, t.x-p.x); 
            p.vx = p.vx*0.9 + Math.cos(a)*2; p.vy = p.vy*0.9 + Math.sin(a)*2; 
        }
        
        p.x+=p.vx; p.y+=p.vy; p.life--;
        
        if(!p.spectral && !p.melee && checkCol(p.x, p.y)) { projs.splice(i,1); continue; }

        let hit = false;
        if(p.area) {
            enemies.forEach(e => { if(Math.hypot(e.x-p.x, e.y-p.y)<p.size) e.hp-=p.dmg; });
        } else {
            for(let j=enemies.length-1; j>=0; j--) {
                let e = enemies[j];
                if(Math.hypot(e.x-p.x, e.y-p.y) < e.r+p.size) { 
                    e.hp-=p.dmg; hit=true; 
                    Particles.spawnParticle(e.x, e.y, p.color, 5, 5, 10);
                    if(e.hp<=0) { enemies.splice(j,1); GameState.checkAchievement('first_blood'); }
                    if(!p.melee) break;
                }
            }
        }
        if(p.life<=0 || (hit && !p.melee && !p.area && !p.spectral)) projs.splice(i,1);
    }
    
    if(enemies.length===0 && spawned>=10*wave) { wave++; spawned=0; player.hp+=20; }
    document.getElementById('stat-1').innerText = `HP: ${Math.floor(player.hp)}`;
    document.getElementById('stat-2').innerText = `ВОЛНА: ${wave}`;
    if(player.hp<=0) Game.endGame(false, 0);
}

export function draw() {
    Graphics.drawBackground('defense');
    
    Graphics.ctx.shadowBlur = 10; Graphics.ctx.shadowColor = '#00bfff'; Graphics.ctx.strokeStyle = '#00bfff'; Graphics.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    obstacles.forEach(o => { Graphics.ctx.fillRect(o.x, o.y, o.w, o.h); Graphics.ctx.strokeRect(o.x, o.y, o.w, o.h); });

    Graphics.drawShape(Graphics.ctx, player.type, player.x, player.y, player.r, player.color, player.skin);

    enemies.forEach(e => {
        Graphics.ctx.fillStyle = e.freeze>0 ? '#0ff' : e.color; 
        Graphics.ctx.shadowBlur=10; Graphics.ctx.shadowColor=Graphics.ctx.fillStyle;
        Graphics.ctx.beginPath(); Graphics.ctx.moveTo(e.x+e.r, e.y); Graphics.ctx.lineTo(e.x, e.y+e.r); Graphics.ctx.lineTo(e.x-e.r, e.y); Graphics.ctx.lineTo(e.x, e.y-e.r); Graphics.ctx.fill();
    });

    projs.forEach(p => {
        Graphics.ctx.fillStyle = p.color; Graphics.ctx.shadowBlur=10; Graphics.ctx.shadowColor=p.color;
        if(p.melee) { 
             Graphics.ctx.beginPath(); Graphics.ctx.arc(p.x, p.y, p.size, p.angle-1, p.angle+1); Graphics.ctx.stroke();
        } else if(p.area) {
             Graphics.drawShape(Graphics.ctx, 2, p.x, p.y, p.size, p.color, 0, false);
        } else {
             Graphics.ctx.beginPath(); Graphics.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); Graphics.ctx.fill();
        }
    });
}