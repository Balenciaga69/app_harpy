import type { IReplayEngine } from '../replay.engine'
import type { LogQueryService } from '../services'
import type { TimelineMoment } from './time-line-moment'
/**
 * TimelineController
 *
 * Converts between tick and progress, detects important events, and provides timeline marker queries for replay.
 */
export class TimelineController {
  private engine: IReplayEngine
  private logQuery: LogQueryService
  constructor(engine: IReplayEngine, logQuery: LogQueryService) {
    this.engine = engine
    this.logQuery = logQuery
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
    const ultimateTicks = this.logQuery.getUltimateTicks()
    ultimateTicks.forEach((tick) => {
      moments.push({ tick, type: 'ultimate', label: 'Ultimate' })
    })
    // Add death moments
    const deathTicks = this.logQuery.getDeathTicks()
    deathTicks.forEach((tick) => {
      moments.push({ tick, type: 'death', label: 'Death' })
    })
    // Add critical hit moments (optional)
    const criticalTicks = this.logQuery.getCriticalTicks()
    criticalTicks.forEach((tick) => {
      moments.push({ tick, type: 'critical', label: 'Critical Hit' })
    })
    // Sort by tick
    return moments.sort((a, b) => a.tick - b.tick)
  }
  /** Get ticks where ultimates were cast */
  public getUltimateTicks(): number[] {
    return this.logQuery.getUltimateTicks()
  }
  /** Get ticks where deaths occurred */
  public getDeathTicks(): number[] {
    return this.logQuery.getDeathTicks()
  }
  /** Get ticks where critical hits occurred */
  public getCriticalTicks(): number[] {
    return this.logQuery.getCriticalTicks()
  }
  /** Get tick range for a given percentage range */
  public getTickRange(startProgress: number, endProgress: number): { start: number; end: number } {
    return {
      start: this.progressToTick(startProgress),
      end: this.progressToTick(endProgress),
    }
  }
}
