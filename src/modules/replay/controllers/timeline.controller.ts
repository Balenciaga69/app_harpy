import type { CombatLogEntry } from '../../combat/logic/logger'
import type { ReplayEngine } from '../replay.engine'
/**
 * Important moment on the timeline
 */
export interface TimelineMoment {
  /** Tick when this moment occurs */
  tick: number
  /** Type of moment (ultimate, death, critical, etc) */
  type: string
  /** Optional label for display */
  label?: string
}
/**
 * TimelineController: Timeline and scrubbing control
 *
 * Handles timeline-related operations:
 * - Convert tick to progress percentage
 * - Convert progress percentage to tick
 * - Find important moments (ultimates, deaths, critical hits)
 */
export class TimelineController {
  private engine: ReplayEngine
  constructor(engine: ReplayEngine) {
    this.engine = engine
  }
  /** Convert tick to progress (0-1) */
  public tickToProgress(tick: number): number {
    const state = this.engine.getState()
    if (state.totalTicks === 0) return 0
    return Math.max(0, Math.min(1, tick / state.totalTicks))
  }
  /** Convert progress (0-1) to tick */
  public progressToTick(progress: number): number {
    const state = this.engine.getState()
    const clampedProgress = Math.max(0, Math.min(1, progress))
    return Math.floor(clampedProgress * state.totalTicks)
  }
  /** Get current progress (0-1) */
  public getCurrentProgress(): number {
    const state = this.engine.getState()
    return this.tickToProgress(state.currentTick)
  }
  /** Seek by progress (0-1) */
  public seekByProgress(progress: number): void {
    const tick = this.progressToTick(progress)
    this.engine.seek(tick)
  }
  /** Get all important event ticks for timeline markers */
  public getImportantMoments(): TimelineMoment[] {
    const moments: TimelineMoment[] = []
    // Add ultimate moments
    const ultimateTicks = this.getUltimateTicks()
    ultimateTicks.forEach((tick) => {
      moments.push({ tick, type: 'ultimate', label: 'Ultimate' })
    })
    // Add death moments
    const deathTicks = this.getDeathTicks()
    deathTicks.forEach((tick) => {
      moments.push({ tick, type: 'death', label: 'Death' })
    })
    // Add critical hit moments (optional)
    const criticalTicks = this.getCriticalTicks()
    criticalTicks.forEach((tick) => {
      moments.push({ tick, type: 'critical', label: 'Critical Hit' })
    })
    // Sort by tick
    return moments.sort((a, b) => a.tick - b.tick)
  }
  /** Get ticks where ultimates were cast */
  public getUltimateTicks(): number[] {
    const state = this.engine.getState()
    const logs = this.engine.getLogsInRange(0, state.totalTicks)
    return logs
      .filter((log) => this.isUltimateEvent(log))
      .map((log) => log.tick)
      .sort((a, b) => a - b)
  }
  /** Get ticks where deaths occurred */
  public getDeathTicks(): number[] {
    const state = this.engine.getState()
    const logs = this.engine.getLogsInRange(0, state.totalTicks)
    return logs
      .filter((log) => log.eventType === 'entity:death')
      .map((log) => log.tick)
      .sort((a, b) => a - b)
  }
  /** Get ticks where critical hits occurred */
  public getCriticalTicks(): number[] {
    const state = this.engine.getState()
    const logs = this.engine.getLogsInRange(0, state.totalTicks)
    return logs
      .filter((log) => log.eventType === 'entity:critical')
      .map((log) => log.tick)
      .sort((a, b) => a - b)
  }
  /** Get tick range for a given percentage range */
  public getTickRange(startProgress: number, endProgress: number): { start: number; end: number } {
    return {
      start: this.progressToTick(startProgress),
      end: this.progressToTick(endProgress),
    }
  }
  // === Helper methods ===
  /** Check if log entry is an ultimate event */
  private isUltimateEvent(log: CombatLogEntry): boolean {
    return log.eventType === 'entity:attack' && (log.payload.isUltimate as boolean) === true
  }
}
