import type { CombatContext } from '../../context'
import { CombatTiming } from '../../infra/config'
/**
 * TickerDriver
 *
 * Drives the combat tick loop, emitting tick events and checking end conditions. Supports max tick limit and
 * configurable stop logic.
 */
const MAX_TICKS = CombatTiming.MAX_TICKS
export class TickerDriver {
  private context: CombatContext
  private readonly maxTicks: number
  private isRunning: boolean = false
  private stopCondition: () => boolean = () => false
  constructor(context: CombatContext, maxTicks: number = MAX_TICKS) {
    this.context = context
    this.maxTicks = maxTicks
  }
  /** Set combat end condition */
  public setStopCondition(condition: () => boolean): void {
    this.stopCondition = condition
  }
  /** Execute single Tick */
  public tick(): void {
    this.context.eventBus.emit('tick:start', { tick: this.context.getCurrentTick() })
    this.context.incrementTick()
    this.context.eventBus.emit('tick:end', { tick: this.context.getCurrentTick() })
  }
  /** Start combat loop (pre-calculation mode) */
  public start(): void {
    this.isRunning = true
    this.context.resetTick()
    this.context.eventBus.emit('combat:start', { tick: 0 })
    while (this.isRunning && this.context.getCurrentTick() < this.maxTicks) {
      this.tick()
      if (this.checkCombatEnd()) {
        this.stop()
      }
    }
  }
  /** Stop combat */
  public stop(): void {
    if (!this.isRunning) return
    this.isRunning = false
    this.context.eventBus.emit('ticker:stopped', { tick: this.context.getCurrentTick() })
  }
  /** Check if combat has ended */
  private checkCombatEnd(): boolean {
    return this.stopCondition()
  }
}
