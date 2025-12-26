/** 單位統計屬性的枚舉，列舉所有可修改的統計屬性 */
export type UnitStatType =
  | 'maxHp'
  | 'currentHp'
  | 'maxEnergy'
  | 'currentEnergy'
  | 'attackDamage'
  | 'evasion'
  | 'resurrectionChance'
  | 'resurrectionHpPercent'

/** 單位統計值映射，描述單位的所有數值屬性 */
export type UnitStats = Record<UnitStatType, number>
