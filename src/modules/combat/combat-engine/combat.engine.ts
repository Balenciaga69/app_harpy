import { EventLogger } from '../logic/logger'
import { SnapshotCollector } from '../logic/snapshot'
import { CombatContext } from '../context'
import type { CombatConfig, CombatResult, CombatResultData } from './models'
import { ResultBuilder } from './builders'
import { TickerDriver } from '../logic/tick'
import { CombatTiming, CombatSystem } from '../infra/config'
import { TickActionSystem } from '../coordination'
import { InMemoryResourceRegistry } from '../infra/resource-registry'
/**
 * CombatEngine
 *
 * Orchestrates a combat run by initializing the core subsystems (TickerDriver, TickActionSystem,
 * EventLogger, SnapshotCollector), driving the tick loop and returning a CombatResult via ResultBuilder.
 * Responsible for subsystem lifecycle (initialize / dispose) and combat flow control.
 */
export class CombatEngine {
  private context: CombatContext
  private ticker!: TickerDriver
  private tickActionSystem!: TickActionSystem
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
    // Initialize resource registry before context
    const registry = new InMemoryResourceRegistry()
    this.context = new CombatContext(registry, this.config.seed)
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
    this.tickActionSystem = new TickActionSystem(this.context)
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
    this.tickActionSystem.dispose()
    this.snapshotCollector.dispose()
  }
}
