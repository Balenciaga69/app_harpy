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
todo: 搬運到 DATA 層或配置文件中
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
