import { AbilitySystem } from '../coordination'
import { EventLogger } from '../logic/logger'
import { SnapshotCollector } from '../logic/snapshot'
import { CombatContext } from '../context'
import type { CombatConfig, CombatResult, CombatResultData } from './models'
import { ResultBuilder } from './builders'
import { TickerDriver, TickerProcessor } from '../logic/tick'
import { CombatTiming, CombatSystem } from '../infra/config'
/**
 * CombatEngine
 *
 * Orchestrates a combat run by initializing the core subsystems (TickerDriver, TickerProcessor, AbilitySystem,
 * EventLogger, SnapshotCollector), driving the tick loop and returning a CombatResult via ResultBuilder.
 * Responsible for subsystem lifecycle (initialize / dispose) and combat flow control.
 */
export class CombatEngine {
  private context: CombatContext
  private ticker!: TickerDriver
  private tickerSystem!: TickerProcessor
  private abilitySystem!: AbilitySystem
  private eventLogger!: EventLogger
  private snapshotCollector!: SnapshotCollector
  private config: CombatConfig
  private startTime: number = 0
  private endTime: number = 0
  constructor(config: CombatConfig) {
    this.config = {
      maxTicks: CombatTiming.MAX_TICKS,
      snapshotInterval: CombatTiming.DEFAULT_SNAPSHOT_INTERVAL,
      enableLogging: CombatSystem.DEFAULT_ENABLE_LOGGING,
      ...config,
    }
    this.context = new CombatContext(this.config.seed)
    this.initializeSystems()
    this.ticker.setStopCondition(() => this.checkBattleEnd())
    this.setupCharacters()
  }
  /** Start combat and return complete result */
  public start(): CombatResult {
    this.startTime = Date.now()
    this.executeCombat()
    this.endTime = Date.now()
    const data: CombatResultData = {
      context: this.context,
      config: this.config,
      logs: [...this.eventLogger.getLogs()],
      snapshots: [...this.snapshotCollector.getSnapshots()],
      startTime: this.startTime,
      endTime: this.endTime,
    }
    const resultBuilder = new ResultBuilder(data)
    return resultBuilder.build()
  }
  /** Initialize core systems */
  private initializeSystems(): void {
    this.ticker = new TickerDriver(this.context, this.config.maxTicks)
    this.tickerSystem = new TickerProcessor(this.context)
    this.abilitySystem = new AbilitySystem(this.context)
    this.eventLogger = new EventLogger(this.context.eventBus)
    this.snapshotCollector = new SnapshotCollector(this.context, this.config.snapshotInterval)
  }
  /** Execute the combat loop */
  private executeCombat(): void {
    this.ticker.start()
  }
  /** Set up characters */
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
  /** Check if combat has ended */
  private checkBattleEnd(): boolean {
    const playerAlive = this.config.playerTeam.some((c) => !c.isDead)
    const enemyAlive = this.config.enemyTeam.some((c) => !c.isDead)
    return !playerAlive || !enemyAlive
  }
  /** Clean up resources */
  public dispose(): void {
    this.ticker.stop()
    this.tickerSystem.dispose()
    this.abilitySystem.dispose()
    this.snapshotCollector.dispose()
  }
}
