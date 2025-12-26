import { DEFAULT_UNIT_STATS, UnitStats } from './models/UnitStats'
/** 單位統計值建造器，提供流暢的鏈式 API 用於構建自訂統計值 */
export class UnitStatsBuilder {
  private stats: UnitStats
  constructor(stats?: UnitStats) {
    this.stats = stats ? { ...stats } : { ...DEFAULT_UNIT_STATS }
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
