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
