export type UnitStatType =
  | 'maxHp'
  | 'currentHp'
  | 'maxEnergy'
  | 'currentEnergy'
  | 'attackDamage'
  | 'evasion'
  | 'resurrectionChance'
  | 'resurrectionHpPercent'
export type UnitStats = Record<UnitStatType, number>
export const DEFAULT_UNIT_STATS: UnitStats = {
  attackDamage: 10,
  currentEnergy: 0,
  currentHp: 100,
  evasion: 5,
  maxEnergy: 100,
  maxHp: 100,
  resurrectionChance: 0.1,
  resurrectionHpPercent: 16,
}
