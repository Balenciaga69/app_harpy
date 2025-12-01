import type { CombatContext } from '../../context'
import type { CombatStartPayload } from '../../infra/event-bus'
/**
 * TickerDriver: Combat time loop driving engine
 *
 * Design concept:
 * - As combat heartbeat system, drives entire combat time progress
 * - Through event-driven mode, emits Tick related events, lets other systems respond to time passage
 * - Supports configurable end conditions, achieves flexible combat termination logic
 * - Sets maximum Tick limit, prevents infinite loops causing program freeze
 * - Focused responsibility: only drives time passage, does not handle status snapshots
 *
 * Main responsibilities:
 * - Execute single Tick, emit tick:start and tick:end events
 * - Manage combat loop, continuously execute Tick until end condition is met
 * - Check combat end condition, stop combat loop at appropriate time
 */
const MAX_TICKS = 100000
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
    this.context.eventBus.emit('combat:start', {} as CombatStartPayload)
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
