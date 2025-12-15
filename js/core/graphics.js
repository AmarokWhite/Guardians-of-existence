import * as GameState from './game-state.js';

const cvs = document.getElementById('gameCanvas');
export const ctx = cvs.getContext('2d');

export function drawShape(ctx, type, x, y, r, color, skinIdx=0, glow=true) {
    ctx.save();
    ctx.translate(x, y);
    
    if(glow) { ctx.shadowBlur = skinIdx===1 ? 25 : 15; ctx.shadowColor = color; }
    
    if (skinIdx === 1) {
        let scale = 1 + Math.sin(Date.now() / 250) * 0.08;
        ctx.scale(scale, scale);
    }

    ctx.fillStyle = color;
    ctx.beginPath();

    if (type === 0) { 
        if (skinIdx === 0) {
            const h = r * Math.sqrt(3) / 2;
            ctx.moveTo(0, -r); ctx.lineTo(r, h/2); ctx.lineTo(-r, h/2);
            ctx.fill();
            ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(2, -r-10); ctx.lineTo(-2, -r-10); ctx.fill();
        } else {
            ctx.fillStyle = "#d000ff"; ctx.shadowColor = "#d000ff";
            ctx.moveTo(0, -r*1.5); ctx.lineTo(r*0.6, 0); ctx.lineTo(0, r*1.2); ctx.lineTo(-r*0.6, 0);
            ctx.fill();
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
        }
    } 
    else if (type === 1) { 
        if (skinIdx === 0) {
            const spikes = 4, outer = r*1.2, inner = r*0.4;
            let rot = Math.PI/4, step = Math.PI/spikes;
            for (let i=0; i<spikes*2; i++) {
                let rad = (i%2===0)?outer:inner; let a=rot+i*step;
                ctx.lineTo(Math.cos(a)*rad, Math.sin(a)*rad);
            }
            ctx.fill();
        } else {
            ctx.fillStyle = "#ffd700"; ctx.shadowColor = "#ffd700";
            ctx.arc(0, 0, r, 0, Math.PI*2);
            ctx.fill();
            ctx.strokeStyle = "#000"; ctx.lineWidth = 3; 
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(r*0.8, 0); ctx.stroke();
            ctx.beginPath(); ctx.arc(0,0,r*0.5,0,Math.PI*2); ctx.stroke();
        }
    } 
    else if (type === 2) { 
        if (skinIdx === 0) {
            const sides = 6, a = (Math.PI * 2) / sides;
            for (let i = 0; i < sides; i++) ctx.lineTo(r * Math.cos(i*a), r * Math.sin(i*a));
            ctx.fill();
        } else {
            ctx.strokeStyle = "#9400d3"; ctx.lineWidth = 4;
            ctx.arc(0,0,r, 0, Math.PI*2); ctx.stroke();
            ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(0,0,r*0.6,0,Math.PI*2); ctx.fill();
        }
    } 
    else if (type === 3) {
        if (skinIdx === 0) {
            ctx.moveTo(0, r*0.5); ctx.lineTo(-r, -r); ctx.lineTo(0, -r*0.5); ctx.lineTo(r, -r);
            ctx.fill();
        } else {
            ctx.fillStyle = "#ff0033";
            ctx.arc(0, -r*0.2, r*0.8, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(-r*0.3, -r*0.2, r*0.2, 0, Math.PI*2); ctx.arc(r*0.3, -r*0.2, r*0.2, 0, Math.PI*2); ctx.fill();
        }
    } 
    else if (type === 4) {
        if (skinIdx === 0) {
            const h = r * Math.sqrt(3) / 2;
            ctx.moveTo(0, r); ctx.lineTo(r, -h/2); ctx.lineTo(-r, -h/2);
            ctx.fill();
        } else {
            ctx.fillStyle = "#fff";
            ctx.moveTo(-r, r*0.5); ctx.lineTo(-r, -r*0.5); ctx.lineTo(-r*0.33, 0); ctx.lineTo(0, -r); ctx.lineTo(r*0.33, 0); ctx.lineTo(r, -r*0.5); ctx.lineTo(r, r*0.5);
            ctx.fill();
        }
    } 
    else if (type === 5) {
        let jx = Math.random()*4-2, jy = Math.random()*4-2;
        if (skinIdx === 0) {
            ctx.rect(-r+jx, -r+jy, r*2, r*2);
            ctx.fill();
        } else {
            ctx.fillStyle = "#0f0"; ctx.font = "bold 20px monospace"; ctx.fillText("10", -10+jx, 5+jy);
            ctx.font = "12px monospace"; ctx.fillText("01", 5+jx, -5+jy);
        }
    }
    
    ctx.restore();
}

export function drawBackground(mode) {
    if(mode === 'defense') {
        ctx.fillStyle = "#050510"; ctx.fillRect(0,0,GameState.W,GameState.H);
        ctx.strokeStyle = 'rgba(0, 191, 255, 0.1)'; ctx.lineWidth=1; 
        ctx.beginPath(); 
        for(let i=0;i<GameState.W;i+=60){ctx.moveTo(i,0);ctx.lineTo(i,GameState.H)} 
        for(let i=0;i<GameState.H;i+=60){ctx.moveTo(0,i);ctx.lineTo(GameState.W,i)} 
        ctx.stroke();
    } 
    else if(mode === 'td') {
        ctx.fillStyle = "#020205"; ctx.fillRect(0,0,GameState.W,GameState.H);
        ctx.strokeStyle = 'rgba(50, 205, 50, 0.05)'; ctx.lineWidth=1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); 
        for(let i=0;i<GameState.W;i+=40){ctx.moveTo(i,0);ctx.lineTo(i,GameState.H)} 
        for(let i=0;i<GameState.H;i+=40){ctx.moveTo(0,i);ctx.lineTo(GameState.W,i)} 
        ctx.stroke(); ctx.setLineDash([]);
    }
    else if(mode === 'boss' || mode === 'jump') {
        let grad = ctx.createLinearGradient(0,0,0,GameState.H);
        grad.addColorStop(0, '#000000'); grad.addColorStop(1, '#1a0b2e');
        ctx.fillStyle = grad; ctx.fillRect(0,0,GameState.W,GameState.H);
        
        ctx.fillStyle = "#fff";
        for(let i=0; i<30; i++) {
             ctx.globalAlpha = Math.random();
             ctx.fillRect(Math.random()*GameState.W, Math.random()*GameState.H, 1, 1);
        }
        ctx.globalAlpha = 1;
    }
}