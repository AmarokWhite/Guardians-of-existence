import * as GameState from '../core/game-state.js';
import * as Input from '../core/input.js';
import * as Graphics from '../core/graphics.js';
import * as Particles from '../core/particles.js';
import * as Game from '../core/game-loop.js';

let boss = { x: 0, y: 0, hp: 1000, maxHp: 1000, r: 60, phase: 0, timer: 0, angle: 0 };
let player, projs = [], bossProjs = [];

export function init() {
    const c = GameState.chars[GameState.selectedCharId];
    player = { 
        x: GameState.W/2, 
        y: GameState.H-100, 
        r: 20, 
        speed: 7, 
        hp: 150, 
        maxHp: 150, 
        color: c.color, 
        cd: 0, 
        maxCd: 12, 
        skillCd: 0, 
        maxSkillCd: 300, 
        type: c.id, 
        skin: c.selectedSkin 
    };
    
    boss = { 
        x: GameState.W/2, 
        y: 150, 
        hp: 3000, 
        maxHp: 3000, 
        r: 60, 
        phase: 0, 
        timer: 0, 
        angle: 0 
    };
    
    bossProjs = []; 
    projs = [];
    document.getElementById('boss-bar-container').style.display = 'block';
}

export function update() {
    player.x += Input.input.x * player.speed; 
    player.y += Input.input.y * player.speed;
    player.x = Math.max(20, Math.min(GameState.W-20, player.x)); 
    player.y = Math.max(20, Math.min(GameState.H-20, player.y));
    
    if(player.cd>0) player.cd--; 
    if(player.skillCd>0) player.skillCd--;

    if(Input.input.attack && player.cd <= 0) {
        player.cd = player.maxCd;
        if(player.type===0) {
            if(Math.hypot(boss.x-player.x, boss.y-player.y) < 150) { 
                boss.hp -= 60; 
                Particles.spawnParticle(boss.x, boss.y, '#fff', 10, 5, 10); 
            }
            Particles.spawnParticle(player.x, player.y - 40, '#ff8c00', 30, 2, 5);
        } else {
            projs.push({
                x: player.x, 
                y: player.y, 
                vx: 0, 
                vy: -15, 
                size: 5, 
                dmg: 25, 
                color: player.color
            });
        }
    }

    if(Input.input.skill && player.skillCd <= 0) {
        player.skillCd = player.maxSkillCd;
        boss.hp -= 300;
        Particles.spawnParticle(boss.x, boss.y, player.color, 50, 10, 20);
    }

    boss.timer++; 
    boss.angle += 0.02;
    boss.x = GameState.W/2 + Math.sin(boss.timer*0.02) * (GameState.W/3); 
    
    if(boss.timer % 40 === 0) { 
        for(let i=0; i<8; i++) {
             let a = boss.angle + (Math.PI*2/8)*i;
             bossProjs.push({
                 x: boss.x, 
                 y: boss.y, 
                 vx: Math.cos(a)*6, 
                 vy: Math.sin(a)*6, 
                 r: 8
             });
        }
    }
    
    for(let i=projs.length-1; i>=0; i--) {
        let p = projs[i]; 
        p.x+=p.vx; 
        p.y+=p.vy;
        if(Math.hypot(p.x-boss.x, p.y-boss.y) < boss.r + p.size) {
            boss.hp -= p.dmg; 
            Particles.spawnParticle(boss.x, boss.y, '#f00', 5, 3, 5); 
            projs.splice(i,1);
        } else if(p.y < 0) projs.splice(i,1);
    }
    
    for(let i=bossProjs.length-1; i>=0; i--) {
        let p = bossProjs[i]; 
        p.x+=p.vx; 
        p.y+=p.vy;
        if(Math.hypot(p.x-player.x, p.y-player.y) < player.r + p.r) {
            player.hp -= 20; 
            Particles.spawnParticle(player.x, player.y, '#f00', 10, 5, 10); 
            bossProjs.splice(i,1);
        }
        if(p.y > GameState.H || p.x < 0 || p.x > GameState.W) bossProjs.splice(i,1);
    }

    document.getElementById('boss-bar-fill').style.width = Math.max(0, (boss.hp/boss.maxHp)*100) + "%";
    document.getElementById('stat-1').innerText = `HP: ${Math.floor(player.hp)}`;
    
    if(boss.hp<=0) { 
        GameState.checkAchievement('boss_killer'); 
        Game.endGame(true, 200); 
    }
    if(player.hp<=0) Game.endGame(false, 0);
}

export function draw() {
    Graphics.drawBackground('boss');
    
    Graphics.ctx.save(); 
    Graphics.ctx.translate(boss.x, boss.y); 
    Graphics.ctx.rotate(boss.angle);
    Graphics.ctx.shadowBlur=30; 
    Graphics.ctx.shadowColor='#ff0055'; 
    Graphics.ctx.fillStyle = '#ff0055'; 
    Graphics.ctx.beginPath(); 
    
    for(let i=0; i<5; i++) {
        Graphics.ctx.lineTo(
            Math.cos(i*4*Math.PI/5)*boss.r, 
            Math.sin(i*4*Math.PI/5)*boss.r
        );
    }
    
    Graphics.ctx.closePath(); 
    Graphics.ctx.fill(); 
    Graphics.ctx.restore();

    Graphics.drawShape(Graphics.ctx, player.type, player.x, player.y, player.r, player.color, player.skin);
    
    projs.forEach(p => { 
        Graphics.ctx.fillStyle=p.color; 
        Graphics.ctx.beginPath(); 
        Graphics.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); 
        Graphics.ctx.fill(); 
    });
    
    bossProjs.forEach(p => { 
        Graphics.ctx.fillStyle = '#fff'; 
        Graphics.ctx.shadowBlur=10; 
        Graphics.ctx.shadowColor='#f00'; 
        Graphics.ctx.beginPath(); 
        Graphics.ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); 
        Graphics.ctx.fill(); 
    });
}