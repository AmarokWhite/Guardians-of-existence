import * as GameState from '../core/game-state.js';
import * as Storage from '../utils/storage.js';

export function init() {
    loadGame();
}

export function showScreen(id) {
    document.querySelectorAll('.menu-panel').forEach(el => el.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    
    if(id==='char-select') renderCharSelect();
    if(id==='achievements-menu') renderAchievements();
}

export function setControl(type) {
    GameState.controlType = type;
    document.getElementById('start-screen').classList.add('hidden');
    loadGame(); 
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('currency-display').classList.remove('hidden');
}

function loadGame() {
    Storage.loadGame();
}

function renderCharSelect() {
    const l = document.getElementById('char-list'); 
    l.innerHTML='';
    
    GameState.chars.forEach((char,i) => {
        let cls = GameState.selectedCharId===i ? 'selected' : '';
        l.innerHTML += `
        <div class="char-card ${cls}" onclick="UI.openCharModal(${i})">
            <div style="font-size:32px; color:${char.color}; margin-bottom:10px;">✦</div>
            <div style="font-weight:bold; font-size:14px;">${char.name}</div>
        </div>`;
    });
}

export function openCharModal(idx) {
    const c = GameState.chars[idx];
    document.getElementById('char-modal-overlay').classList.remove('hidden');
    
    let skinsHTML = '';
    c.skins.forEach((s, sIdx) => {
        let state = s.unlocked 
            ? (c.selectedSkin === sIdx ? 'ВЫБРАН' : 'ВЫБРАТЬ') 
            : `КУПИТЬ (${s.cost || 100}★)`;
        let action = s.unlocked ? `UI.selectSkin(${idx}, ${sIdx})` : `UI.buySkin(${idx}, ${sIdx})`;
        let activeClass = c.selectedSkin === sIdx ? 'active' : '';
        
        skinsHTML += `
            <div class="skin-option ${activeClass}" onclick="${action}">
                <span class="skin-title">${s.name}</span>
                <span style="font-size:12px; color:${s.unlocked ? '#0f0' : '#888'}">${state}</span>
            </div>
        `;
    });

    document.getElementById('modal-content').innerHTML = `
        <h2 style="border:none; margin:0; color:${c.color}">${c.name}</h2>
        <div style="font-size:12px; opacity:0.7; margin-bottom:15px;">${c.title}</div>
        <div class="lore-text">${c.lore}</div>
        <div style="text-align:left; color:#fff; font-size:14px; margin-bottom:10px;">${c.desc}</div>
        <button class="btn" style="padding:10px; width:100%; margin: 10px 0;" onclick="UI.selectChar(${idx})">ИГРАТЬ ЭТИМ ГЕРОЕМ</button>
        <div class="skin-row">${skinsHTML}</div>
    `;
}

export function closeCharModal() { 
    document.getElementById('char-modal-overlay').classList.add('hidden'); 
    renderCharSelect(); 
}

export function selectChar(i) { 
    GameState.selectedCharId = i; 
    closeCharModal(); 
    showScreen('main-menu'); 
}

export function selectSkin(charIdx, skinIdx) {
    GameState.chars[charIdx].selectedSkin = skinIdx;
    Storage.saveGame();
    openCharModal(charIdx);
}

export function buySkin(charIdx, skinIdx) {
    const char = GameState.chars[charIdx];
    const skin = char.skins[skinIdx];
    
    if(GameState.stars >= (skin.cost || 100)) {
        GameState.stars -= (skin.cost || 100);
        skin.unlocked = true;
        char.selectedSkin = skinIdx;
        GameState.updateStars();
        Storage.saveGame();
        openCharModal(charIdx);
        GameState.checkAchievement('fashion');
    } else {
        alert("Недостаточно звезд материи!");
    }
}

function renderAchievements() {
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