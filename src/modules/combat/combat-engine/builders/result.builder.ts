import type { CombatContext } from '@/modules/combat/context'
import type { ICharacter } from '../../domain/character'
import type { EventLogger } from '../../logic/logger'
import type { SnapshotCollector } from '../../logic/snapshot'
import type { CombatConfig, CombatOutcome, CombatResult, CombatStatistics, CharacterStats } from '../models'
import type { CombatLogEntry } from '../../logic/logger'
/**
 * ResultBuilder
 *
 * Assembles a CombatResult from context, config, logs, and snapshots. Determines outcome, survivors, and statistics.
 */
export class ResultBuilder {
  private context: CombatContext
  private config: CombatConfig
  private eventLogger: EventLogger
  private snapshotCollector: SnapshotCollector
  private startTime: number
  private endTime: number
  constructor(
    context: CombatContext,
    config: CombatConfig,
    eventLogger: EventLogger,
    snapshotCollector: SnapshotCollector,
    startTime: number,
    endTime: number
  ) {
    this.context = context
    this.config = config
    this.eventLogger = eventLogger
    this.snapshotCollector = snapshotCollector
    this.startTime = startTime
    this.endTime = endTime
  }
  /** Build complete combat result */
  build(): CombatResult {
    const { outcome, winner } = this.analyzeOutcome()
    const survivors = this.getSurvivors()
    const totalTicks = this.context.getCurrentTick()
    const logs = this.collectLogs()
    const snapshots = this.snapshotCollector.getSnapshots()
    const statistics = this.buildStatistics()
    return {
      outcome,
      winner,
      survivors,
      totalTicks,
      logs,
      snapshots,
      statistics,
      startedAt: this.startTime,
      endedAt: this.endTime,
    }
  }
  /** Analyze combat outcome */
  private analyzeOutcome(): { outcome: CombatOutcome; winner: 'player' | 'enemy' | null } {
    const playerAlive = this.config.playerTeam.some((c) => !c.isDead)
    const enemyAlive = this.config.enemyTeam.some((c) => !c.isDead)
    const reachedMaxTicks = this.context.getCurrentTick() >= (this.config.maxTicks ?? 10000)
    if (playerAlive && !enemyAlive) {
      return { outcome: 'player-win', winner: 'player' }
    }
    if (!playerAlive && enemyAlive) {
      return { outcome: 'enemy-win', winner: 'enemy' }
    }
    if (!playerAlive && !enemyAlive) {
      return { outcome: 'draw', winner: null }
    }
    if (reachedMaxTicks) {
      return { outcome: 'timeout', winner: null }
    }
    // Default case (should not happen)
    return { outcome: 'draw', winner: null }
  }
  /** Get survivors */
  private getSurvivors(): ICharacter[] {
    return [...this.config.playerTeam, ...this.config.enemyTeam].filter((c) => !c.isDead)
  }
  /** Collect event logs */
  private collectLogs(): CombatLogEntry[] {
    return this.eventLogger.getLogs() as CombatLogEntry[]
  }
  /** Build statistics (currently empty shell) */
  private buildStatistics(): CombatStatistics {
    const allCharacters = [...this.config.playerTeam, ...this.config.enemyTeam]
    const characterStats = new Map<string, CharacterStats>()
    // Initialize statistics for each character
    allCharacters.forEach((char) => {
      characterStats.set(char.id, {
        characterId: char.id,
        name: char.name,
        damageDealt: 0,
        damageTaken: 0,
        kills: 0,
        survived: !char.isDead,
        attackCount: 0,
        criticalHits: 0,
        dodges: 0,
      })
    })
    // TODO: Statistics calculation logic
    // Need to calculate data from eventLogger logs
    // Suggest implementing StatisticsCalculator class in the future
    const totalDamage = 0
    return {
      characterStats,
      effectsApplied: new Map(),
      totalDamage,
      duration: this.context.getCurrentTick(),
    }
  }
}
