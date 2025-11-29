import type { WeaponStats, GearStats, CharacterStats } from '../types/stats.type'
export function CreateIceWeapon(): WeaponStats {
  return {
    damages: [
      { type: 'physical', amount: 100 },
      { type: 'ice', amount: 10 },
    ],
    accuracy: 1000,
    criticalChance: 20,
    cooldown: 200,
    strategyIds: [],
  }
}
export function CreateFireLightningWeapon(): WeaponStats {
  return {
    damages: [
      { type: 'fire', amount: 500 },
      { type: 'lightning', amount: 500 },
    ],
    accuracy: 1000,
    cooldown: 200,
    criticalChance: 1,
    strategyIds: [],
  }
}
// 創造 Gear
export function CreateIceGear(): GearStats {
  return {
    hp: 100,
    evasion: 0,
    armor: 100,
    strategyIds: [],
  }
}
export function CreateEnemyACharacter(): CharacterStats {
  return {
    armor: 50,
    evasion: 20,
    gears: [CreateIceGear()],
    hp: 1000,
    weapon: CreateFireLightningWeapon(),
  }
}
export function CreatePlayerCharacter(): CharacterStats {
  return {
    armor: 100,
    evasion: 100,
    gears: [CreateIceGear()],
    hp: 1000,
    weapon: CreateIceWeapon(),
  }
}
