import { DEFAULT_UNIT_STATS, UnitStats } from './models/UnitStats'
export class UnitStatsBuilder {
  private stats: UnitStats
  constructor(stats?: UnitStats) {
    this.stats = stats ? { ...stats } : { ...DEFAULT_UNIT_STATS }
  }
  add(stat: keyof UnitStats, value: number): UnitStatsBuilder {
    this.stats[stat] += value
    return this
  }
  multiply(stat: keyof UnitStats, factor: number): UnitStatsBuilder {
    this.stats[stat] *= factor
    return this
  }
  build(): UnitStats {
    return this.stats
  }
}
