import * as GameState from '../core/game-state.js';

export function getCharacterStats(charId) {
    const char = GameState.chars[charId];
    const baseStats = {
        0: { hp: 200, speed: 7, attackCd: 25, attackType: 'melee' },
        1: { hp: 120, speed: 8, attackCd: 8, attackType: 'fast' },
        2: { hp: 120, speed: 6, attackCd: 15, attackType: 'magic' },
        3: { hp: 120, speed: 6, attackCd: 12, attackType: 'homing' },
        4: { hp: 120, speed: 6, attackCd: 20, attackType: 'sniper' },
        5: { hp: 120, speed: 6, attackCd: 20, attackType: 'chaos' }
    };
    
    return {
        ...baseStats[charId],
        color: char.color,
        skin: char.selectedSkin,
        type: char.id
    };
}