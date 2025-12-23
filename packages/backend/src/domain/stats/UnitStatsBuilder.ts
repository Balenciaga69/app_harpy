import { UnitStats } from './models/UnitStats'
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
export class UnitStatsBuilder {
  private stats: UnitStats
  constructor() {
    this.stats = { ...BaseUnitStats }
  }
  Add(stat: keyof UnitStats, value: number): UnitStatsBuilder {
    this.stats[stat] += value
    return this
  }
  Multiply(stat: keyof UnitStats, factor: number): UnitStatsBuilder {
    this.stats[stat] *= factor
    return this
  }
  Build(): UnitStats {
    return this.stats
  }
}
