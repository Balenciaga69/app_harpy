import { CombatConfig } from '../..'
import { CombatTiming } from '../../domain/config/CombatConstants'
import { EventBus as CombatEventBus } from '../../infra/event-bus/EventBus'
import { InMemoryResourceRegistry } from '../../infra/resource-registry/InMemoryResourceRegistry'
import type { IResourceRegistry } from '../../interfaces/resource-registry/IResourceRegistry'
import { PreMatchEffectApplicator } from './utils/PreMatchEffectApplicator'
/**
 * 戰鬥引擎
 *
 * 負責協調各子系統
 * 管理戰鬥生命週期並產生最終結果。
 *
 * 錯誤處理策略：
 * - 這是唯一可能拋出 CombatError 的邊界層
 * - 所有內部系統都使用 Result 模式或優雅降級
 * - 捕捉任何未預期錯誤並包裝成 CombatError
 */
export class CombatEngine {
  private context: CombatContext //TODO: 判斷是否需要 介面
  private ticker!: TickerDriver //TODO: 判斷是否需要 介面
  private tickActionSystem!: TickActionSystem //TODO: 判斷是否需要 介面
  private eventLogger!: EventLogger //TODO: 判斷是否需要 介面
  private snapshotCollector!: SnapshotCollector //TODO: 判斷是否需要 介面
  private config: CombatConfig
  constructor(config: CombatConfig, registry?: IResourceRegistry) {
    this.config = {
      maxTicks: CombatTiming.MAX_TICKS,
      snapshotInterval: CombatTiming.DEFAULT_SNAPSHOT_INTERVAL,
      enableLogging: CombatSystem.DEFAULT_ENABLE_LOGGING,
      ...config,
    }
    const resourceRegistry = registry ?? new InMemoryResourceRegistry()
    const eventBus = new CombatEventBus()
    this.context = new CombatContext(eventBus, resourceRegistry, this.config.seed) //TODO: 判斷是否需要 介面
    this.initializeSystems()
    this.ticker.setStopCondition(() => this.checkBattleEnd())
    this.setupCharacters()
  }
  /**
   * Start combat execution
   * This is the boundary layer - catches all internal errors and converts to CombatError
   */
  public start(): CombatResult {
    try {
      this.executeCombat()
      const data: CombatResultData = {
        context: this.context,
        config: this.config,
        logs: [...this.eventLogger.getLogs()],
        snapshots: [...this.snapshotCollector.getSnapshots()],
      }
      const resultBuilder = new ResultBuilder(data)
      return resultBuilder.build()
    } catch (error) {
      if (error instanceof CombatError) throw error
      const message = error instanceof Error ? error.message : 'Unknown combat error'
      throw new CombatError(`Combat execution failed: ${message}`, CombatFailureCode.UNKNOWN)
    }
  }
  private initializeSystems(): void {
    this.tickActionSystem = new TickActionSystem(this.context)
    this.eventLogger = new EventLogger(this.context.eventBus)
    this.snapshotCollector = new SnapshotCollector(this.context, this.config.snapshotInterval)
  }
  private executeCombat(): void {
    // Apply pre-match effects before combat starts
    if (this.config.preMatchEffects && this.config.preMatchEffects.length > 0) {
      PreMatchEffectApplicator.applyEffects(this.config.preMatchEffects, this.context)
    }
    this.ticker.start()
    this.emitCombatEnd()
  }
  private emitCombatEnd(): void {
    const { outcome, winner } = OutcomeAnalyzer.analyze(
      this.config.playerTeam,
      this.config.enemyTeam,
      this.context.getCurrentTick(),
      this.config.maxTicks ?? CombatTiming.MAX_TICKS
    )
    this.context.eventBus.emit('combat:end', {
      winner,
      outcome,
      tick: this.context.getCurrentTick(),
    })
  }
  private setupCharacters(): void {
    // Add player team characters
    this.config.playerTeam.forEach((character) => {
      this.context.addEntity(character)
    })
    // Add enemy team characters
    this.config.enemyTeam.forEach((character) => {
      this.context.addEntity(character)
    })
  }
  private checkBattleEnd(): boolean {
    const playerAlive = this.config.playerTeam.some((c) => !c.isDead)
    const enemyAlive = this.config.enemyTeam.some((c) => !c.isDead)
    return !playerAlive || !enemyAlive
  }
  public dispose(): void {
    this.ticker.stop()
    this.tickActionSystem.dispose()
    this.snapshotCollector.dispose()
  }
}
