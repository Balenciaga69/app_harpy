import { UnitStats } from './models/UnitStats'
/** 單位統計的基礎值，作為所有新建單位的起始點 */
const BaseUnitStats: UnitStats = {
  attackDamage: 25,
  currentEnergy: 0,
  currentHp: 1000,
  evasion: 0,
  maxEnergy: 100,
  maxHp: 1000,
  resurrectionChance: 0.05,
  resurrectionHpPercent: 20,
}
/** 單位統計值建造器，提供流暢的鏈式 API 用於構建自訂統計值 */
export class UnitStatsBuilder {
  private stats: UnitStats
  constructor() {
    this.stats = { ...BaseUnitStats }
  }
  /** 將指定統計屬性增加指定值，返回建造器以支持鏈式調用 */
  Add(stat: keyof UnitStats, value: number): UnitStatsBuilder {
    this.stats[stat] += value
    return this
  }
  /** 將指定統計屬性乘以指定倍數，返回建造器以支持鏈式調用 */
  Multiply(stat: keyof UnitStats, factor: number): UnitStatsBuilder {
    this.stats[stat] *= factor
    return this
  }
  /** 返回構建完成的統計值映射，結束鏈式調用 */
  Build(): UnitStats {
    return this.stats
  }
}
