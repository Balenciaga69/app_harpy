import type { CombatConfig } from '../../interfaces/combat-engine/CombatConfig'
import type { CombatResult } from '../../interfaces/combat-engine/CombatResult'
import type { CombatResultData } from '../../interfaces/combat-engine/CombatResultData'
import type { ICombatContext } from '../../interfaces/context/ICombatContext'
import type { IResourceRegistry } from '../../interfaces/resource-registry/IResourceRegistry'
import type { IEventLogger } from '../../interfaces/logger/IEventLogger'
import { CombatTiming, CombatSystem } from '../../domain/config/CombatConstants'
import { CombatError } from '../../domain/errors/CombatError'
import { CombatFailureCode } from '../../interfaces/errors/CombatFailure'
import type { ITickActionSystem } from '../../interfaces/coordination/ITickActionSystem'
import type { ITickerDriver } from '../../interfaces/combat-engine/ITickerDriver'
import type { ISnapshotCollector } from '../../interfaces/combat-engine/ISnapshotCollector'
import type { ICombatInfrastructureFactory } from '../../interfaces/factories/ICombatInfrastructureFactory'
import type { ICoordinationFactory } from '../../interfaces/factories/ICoordinationFactory'
import { CombatContext } from './CombatContext'
import { TickerDriver } from './TickerDriver'
import { SnapshotCollector } from './SnapshotCollector'
import { ResultBuilder } from './ResultBuilder'
import { OutcomeAnalyzer } from './OutcomeAnalyzer'
import { PreMatchEffectApplicator } from './PreMatchEffectApplicator'
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
  private context!: ICombatContext
  private ticker!: ITickerDriver
  private tickActionSystem!: ITickActionSystem
  private eventLogger!: IEventLogger
  private snapshotCollector!: ISnapshotCollector
  private config: CombatConfig
  private infraFactory: ICombatInfrastructureFactory
  private coordFactory: ICoordinationFactory
  constructor(
    config: CombatConfig,
    infraFactory: ICombatInfrastructureFactory,
    coordFactory: ICoordinationFactory,
    registry?: IResourceRegistry
  ) {
    this.infraFactory = infraFactory
    this.coordFactory = coordFactory
    this.config = {
      maxTicks: CombatTiming.MAX_TICKS,
      snapshotInterval: CombatTiming.DEFAULT_SNAPSHOT_INTERVAL,
      enableLogging: CombatSystem.DEFAULT_ENABLE_LOGGING,
      ...config,
    }
    const resourceRegistry = registry ?? this.infraFactory.createResourceRegistry()
    const eventBus = this.infraFactory.createEventBus()
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
      if (error instanceof CombatError) throw error
      const message = error instanceof Error ? error.message : 'Unknown combat error'
      throw new CombatError(`Combat execution failed: ${message}`, CombatFailureCode.UNKNOWN)
    }
  }
  private initializeSystems(): void {
    this.ticker = new TickerDriver(this.context, this.config.maxTicks)
    this.tickActionSystem = this.coordFactory.createTickActionSystem(this.context)
    this.eventLogger = this.infraFactory.createEventLogger(this.context.eventBus)
    this.snapshotCollector = new SnapshotCollector(this.context, this.config.snapshotInterval)
  }
  private executeCombat(): void {
    // Apply pre-match effects before combat starts
    const preMatchApplicator = new PreMatchEffectApplicator()
    preMatchApplicator.applyEffects(this.context)
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
