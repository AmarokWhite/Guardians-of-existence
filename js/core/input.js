import * as GameState from './game-state.js';

export const input = { x: 0, y: 0, attack: false, skill: false, mouse: {x:0, y:0, down: false} };
const keys = {};

let joyStart = {x:0, y:0}, joyActive = false;

export function init() {
    const cvs = document.getElementById('gameCanvas');
    
    window.addEventListener('keydown', e => { keys[e.code] = true; if(e.code === 'KeyE') input.skill = true; updatePCInput(); });
    window.addEventListener('keyup', e => { keys[e.code] = false; if(e.code === 'KeyE') input.skill = false; updatePCInput(); });
    
    window.addEventListener('mousemove', e => { 
        const r = cvs.getBoundingClientRect(); 
        input.mouse.x = e.clientX - r.left; 
        input.mouse.y = e.clientY - r.top; 
    });
    
    window.addEventListener('mousedown', e => {
        if(e.target.tagName !== 'BUTTON' && !e.target.closest('.char-modal')) {
            input.mouse.down = true; 
            if(GameState.mode === 'defense' || GameState.mode === 'boss') input.attack = true;
        }
    });
    
    window.addEventListener('mouseup', () => { 
        input.mouse.down = false; 
        if(GameState.mode !== 'td') input.attack = false; 
    });
    
    cvs.addEventListener('touchstart', e => { 
        e.preventDefault(); 
        input.mouse.down = true; 
    }, {passive: false});
    
    const joyArea = document.getElementById('joystick-area');
    const joyKnob = document.getElementById('joystick-knob');
    
    joyArea.addEventListener('touchstart', e => { 
        e.preventDefault(); 
        joyActive = true; 
        joyStart = {x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY}; 
    });
    
    joyArea.addEventListener('touchmove', e => {
        e.preventDefault(); 
        if(!joyActive) return;
        const t = e.changedTouches[0];
        let dx = t.clientX - joyStart.x, dy = t.clientY - joyStart.y;
        const dist = Math.hypot(dx, dy); 
        const max = 60;
        if(dist > max) { dx = (dx/dist)*max; dy = (dy/dist)*max; }
        joyKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        input.x = dx/max; 
        input.y = dy/max;
    });
    
    joyArea.addEventListener('touchend', e => { 
        e.preventDefault(); 
        joyActive = false; 
        input.x = 0; 
        input.y = 0; 
        joyKnob.style.transform = `translate(-50%, -50%)`; 
    });
    
    const btnAttack = document.getElementById('btn-atk');
    const btnSkill = document.getElementById('btn-skill');
    
    btnAttack.addEventListener('touchstart', e => {
        e.preventDefault();
        e.stopPropagation();
        input.attack = true;
    }, {passive: false});
    
    btnAttack.addEventListener('touchend', e => {
        e.preventDefault();
        e.stopPropagation();
        input.attack = false;
    }, {passive: false});
    
    btnSkill.addEventListener('touchstart', e => {
        e.preventDefault();
        e.stopPropagation();
        input.skill = true;
    }, {passive: false});
    
    btnSkill.addEventListener('touchend', e => {
        e.preventDefault();
        e.stopPropagation();
        input.skill = false;
    }, {passive: false});
    
    btnAttack.addEventListener('mousedown', e => {
        if(GameState.controlType === 'mobile' || e.pointerType === 'touch') {
            input.attack = true;
        }
    });
    
    btnAttack.addEventListener('mouseup', e => {
        if(GameState.controlType === 'mobile' || e.pointerType === 'touch') {
            input.attack = false;
        }
    });
    
    btnSkill.addEventListener('mousedown', e => {
        if(GameState.controlType === 'mobile' || e.pointerType === 'touch') {
            input.skill = true;
        }
    });
    
    btnSkill.addEventListener('mouseup', e => {
        if(GameState.controlType === 'mobile' || e.pointerType === 'touch') {
            input.skill = false;
        }
    });
}

export function updatePCInput() {
    if(GameState.controlType === 'mobile') return;
    
    input.x = 0; 
    input.y = 0;
    if(keys['KeyW'] || keys['ArrowUp']) input.y = -1;
    if(keys['KeyS'] || keys['ArrowDown']) input.y = 1;
    if(keys['KeyA'] || keys['ArrowLeft']) input.x = -1;
    if(keys['KeyD'] || keys['ArrowRight']) input.x = 1;
    if(keys['Space'] && (GameState.mode === 'defense' || GameState.mode === 'boss')) input.skill = true;
    if(GameState.mode !== 'jump' && input.x && input.y) { 
        input.x *= 0.707; 
        input.y *= 0.707; 
    }
}