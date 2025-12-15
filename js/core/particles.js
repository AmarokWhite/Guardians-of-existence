import * as GameState from './game-state.js';
import { ctx } from './graphics.js';

export const particles = [];

export function spawnParticle(x, y, color, size, speed, life) { 
    particles.push({x, y, color, size, vx: (Math.random()-0.5)*speed, vy: (Math.random()-0.5)*speed, life, maxLife: life}); 
}

export function updateParticles() {
    for(let i=particles.length-1; i>=0; i--) {
        let p = particles[i]; 
        p.x += p.vx; 
        p.y += p.vy; 
        p.life--; 
        p.size *= 0.94;
        if(p.life <= 0) particles.splice(i, 1);
    }
}

export function drawParticles() {
    particles.forEach(p => { 
        ctx.fillStyle = p.color; 
        ctx.globalAlpha = p.life/p.maxLife; 
        ctx.beginPath(); 
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); 
        ctx.fill(); 
    });
    ctx.globalAlpha = 1; 
}