import type { CombatLogEntry } from '../../combat/logic/logger'
import type { ReplayEngine } from '../replay.engine'
/**
 * PlaybackController: High-level playback control
 *
 * Provides convenient methods for common playback scenarios:
 * - Jump to combat start/end
 * - Jump to next/previous ultimate
 * - Jump to next/previous death event
 * - Toggle play/pause
 */
export class PlaybackController {
  private engine: ReplayEngine
  constructor(engine: ReplayEngine) {
    this.engine = engine
  }
  /** Toggle between play and pause */
  public togglePlayPause(): void {
    const state = this.engine.getState()
    if (state.isPlaying) {
      this.engine.pause()
    } else {
      this.engine.play()
    }
  }
  /** Jump to combat start */
  public jumpToStart(): void {
    this.engine.seek(0)
  }
  /** Jump to combat end */
  public jumpToEnd(): void {
    const state = this.engine.getState()
    this.engine.seek(state.totalTicks)
  }
  /** Jump to next ultimate cast */
  public jumpToNextUltimate(): void {
    const state = this.engine.getState()
    const ultimateTicks = this.getUltimateTicks()
    const nextTick = ultimateTicks.find((tick) => tick > state.currentTick)
    if (nextTick !== undefined) {
      this.engine.seek(nextTick)
    }
  }
  /** Jump to previous ultimate cast */
  public jumpToPrevUltimate(): void {
    const state = this.engine.getState()
    const ultimateTicks = this.getUltimateTicks()
    const prevTick = ultimateTicks.reverse().find((tick) => tick < state.currentTick)
    if (prevTick !== undefined) {
      this.engine.seek(prevTick)
    }
  }
  /** Jump to next death event */
  public jumpToNextDeath(): void {
    const state = this.engine.getState()
    const deathTicks = this.getDeathTicks()
    const nextTick = deathTicks.find((tick) => tick > state.currentTick)
    if (nextTick !== undefined) {
      this.engine.seek(nextTick)
    }
  }
  /** Jump to previous death event */
  public jumpToPrevDeath(): void {
    const state = this.engine.getState()
    const deathTicks = this.getDeathTicks()
    const prevTick = deathTicks.reverse().find((tick) => tick < state.currentTick)
    if (prevTick !== undefined) {
      this.engine.seek(prevTick)
    }
  }
  /** Jump forward by N ticks */
  public skipForward(ticks: number): void {
    const state = this.engine.getState()
    this.engine.seek(state.currentTick + ticks)
  }
  /** Jump backward by N ticks */
  public skipBackward(ticks: number): void {
    const state = this.engine.getState()
    this.engine.seek(state.currentTick - ticks)
  }
  // === Helper methods ===
  /** Get all ticks where ultimates were cast */
  private getUltimateTicks(): number[] {
    const state = this.engine.getState()
    const logs = this.engine.getLogsInRange(0, state.totalTicks)
    return logs
      .filter((log) => this.isUltimateEvent(log))
      .map((log) => log.tick)
      .sort((a, b) => a - b)
  }
  /** Get all ticks where deaths occurred */
  private getDeathTicks(): number[] {
    const state = this.engine.getState()
    const logs = this.engine.getLogsInRange(0, state.totalTicks)
    return logs
      .filter((log) => log.eventType === 'entity:death')
      .map((log) => log.tick)
      .sort((a, b) => a - b)
  }
  /** Check if log entry is an ultimate event */
  private isUltimateEvent(log: CombatLogEntry): boolean {
    // Ultimate events can be identified by checking payload or event type
    // This is a simplified check - adjust based on actual implementation
    return log.eventType === 'entity:attack' && (log.payload.isUltimate as boolean) === true
  }
}
