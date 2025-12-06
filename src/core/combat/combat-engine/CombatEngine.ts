import { CombatContext } from '../context'
import { TickActionSystem } from '../coordination'
import { CombatSystem, CombatTiming } from '../infra/config'
import { CombatError, CombatFailureCode } from '../infra/errors'
import { CombatEventBus } from '../infra/event-bus'
import { InMemoryResourceRegistry } from '../infra/resource-registry'
import type { IResourceRegistry } from '../infra/resource-registry/resource-registry'
import { EventLogger } from '../logic/logger'
import { SnapshotCollector } from '../logic/snapshot'
import { TickerDriver } from '../logic/tick'
import { ResultBuilder } from './builders'
import type { CombatConfig, CombatResult, CombatResultData } from './models'
/**
 * 戰鬥引擎
 *
 * 負責協調各子系統 (TickerDriver, TickActionSystem, EventLogger, SnapshotCollector)，
 * 管理戰鬥生命週期並產生最終 CombatResult。
 *
 * 錯誤處理策略：
 * - 這是唯一可能拋出 CombatError 的邊界層
 * - 所有內部系統都使用 Result 模式或優雅降級
 * - 捕捉任何未預期錯誤並包裝成 CombatError
 */
export class CombatEngine {
  private context: CombatContext
  private ticker!: TickerDriver
  private tickActionSystem!: TickActionSystem
  private eventLogger!: EventLogger
  private snapshotCollector!: SnapshotCollector
  private config: CombatConfig
  constructor(config: CombatConfig, registry?: IResourceRegistry) {
    this.config = {
      maxTicks: CombatTiming.MAX_TICKS,
      snapshotInterval: CombatTiming.DEFAULT_SNAPSHOT_INTERVAL,
      enableLogging: CombatSystem.DEFAULT_ENABLE_LOGGING,
      ...config,
    }
    // Use provided registry or create default in-memory implementation
    const resourceRegistry = registry ?? new InMemoryResourceRegistry()
    const eventBus = new CombatEventBus()
    this.context = new CombatContext(eventBus, resourceRegistry, this.config.seed)
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
      // Convert any unexpected error to CombatError
      if (error instanceof CombatError) {
        throw error
      }
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
    this.ticker.start()
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
