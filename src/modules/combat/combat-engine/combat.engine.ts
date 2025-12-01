import { AbilitySystem } from '../coordination'
import { EventLogger } from '../logic/logger'
import { SnapshotCollector } from '../logic/snapshot'
import { CombatContext } from '../context'
import type { CombatConfig, CombatResult } from './models'
import { ResultBuilder } from './builders'
import { TickerDriver, TickerProcessor } from '../logic/tick'
/**
 * CombatEngine
 *
 * Orchestrates a combat run by initializing the core subsystems (TickerDriver, TickerProcessor, AbilitySystem,
 * EventLogger, SnapshotCollector), driving the tick loop and returning a CombatResult via ResultBuilder.
 * Responsible for subsystem lifecycle (initialize / dispose) and combat flow control.
 */
export class CombatEngine {
  private context: CombatContext
  private ticker: TickerDriver
  private tickerSystem: TickerProcessor
  private abilitySystem: AbilitySystem
  private eventLogger: EventLogger
  private snapshotCollector: SnapshotCollector
  private config: CombatConfig
  private startTime: number = 0
  private endTime: number = 0
  constructor(config: CombatConfig) {
    this.config = {
      maxTicks: 10000,
      snapshotInterval: 100,
      enableLogging: true,
      ...config,
    }
    // 1. Initialize combat context
    this.context = new CombatContext(this.config.seed)
    // 2. Initialize core systems
    this.ticker = new TickerDriver(this.context, this.config.maxTicks)
    this.tickerSystem = new TickerProcessor(this.context)
    this.abilitySystem = new AbilitySystem(this.context)
    this.eventLogger = new EventLogger(this.context.eventBus)
    this.snapshotCollector = new SnapshotCollector(this.context, this.config.snapshotInterval)
    // 3. Set combat end condition
    this.ticker.setStopCondition(() => this.checkBattleEnd())
    // 4. Create and add all characters
    this.setupCharacters()
  }
  /** Start combat and return complete result */
  public start(): CombatResult {
    this.startTime = Date.now()
    this.ticker.start()
    this.endTime = Date.now()
    const resultBuilder = new ResultBuilder(
      this.context,
      this.config,
      this.eventLogger,
      this.snapshotCollector,
      this.startTime,
      this.endTime
    )
    return resultBuilder.build()
  }
  /** Set up characters */
  private setupCharacters(): void {
    // Add player team
    this.config.playerTeam.forEach((character) => {
      this.context.addEntity(character)
    })
    // Add enemy team
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
