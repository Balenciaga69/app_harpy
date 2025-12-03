import type { CombatResult, CombatResultData } from '../models'
import { OutcomeAnalyzer } from './utils/outcome.analyzer'
import { SurvivorCollector } from './utils/survivor.collector'
import { StatisticsBuilder } from './utils/statistics.builder'
/**
 * ResultBuilder
 *
 * Assembles a CombatResult from encapsulated data. Determines outcome, survivors, and statistics.
 */
export class ResultBuilder {
  private data: CombatResultData
  constructor(data: CombatResultData) {
    this.data = data
  }
  /** Build complete combat result */
  build(): CombatResult {
    const { outcome, winner } = OutcomeAnalyzer.analyze(
      this.data.config.playerTeam,
      this.data.config.enemyTeam,
      this.data.context.getCurrentTick(),
      this.data.config.maxTicks ?? 10000
    )
    const survivors = SurvivorCollector.collect(this.data.config.playerTeam, this.data.config.enemyTeam)
    const totalTicks = this.data.context.getCurrentTick()
    const logs = this.data.logs
    const snapshots = this.data.snapshots
    const statistics = StatisticsBuilder.build(
      this.data.config.playerTeam,
      this.data.config.enemyTeam,
      this.data.context.getCurrentTick()
    )
    return {
      outcome,
      winner,
      survivors,
      totalTicks,
      logs,
      snapshots,
      statistics,
    }
  }
}
