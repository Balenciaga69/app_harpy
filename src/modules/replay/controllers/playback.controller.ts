import type { IReplayEngine } from '../replay.engine.interface'
import type { LogQueryService } from '../services'
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
  private engine: IReplayEngine
  private logQuery: LogQueryService
  constructor(engine: IReplayEngine, logQuery: LogQueryService) {
    this.engine = engine
    this.logQuery = logQuery
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
    const ultimateTicks = this.logQuery.getUltimateTicks()
    const nextTick = ultimateTicks.find((tick) => tick > state.currentTick)
    if (nextTick !== undefined) {
      this.engine.seek(nextTick)
    }
  }
  /** Jump to previous ultimate cast */
  public jumpToPrevUltimate(): void {
    const state = this.engine.getState()
    const ultimateTicks = this.logQuery.getUltimateTicks()
    const prevTick = ultimateTicks.reverse().find((tick) => tick < state.currentTick)
    if (prevTick !== undefined) {
      this.engine.seek(prevTick)
    }
  }
  /** Jump to next death event */
  public jumpToNextDeath(): void {
    const state = this.engine.getState()
    const deathTicks = this.logQuery.getDeathTicks()
    const nextTick = deathTicks.find((tick) => tick > state.currentTick)
    if (nextTick !== undefined) {
      this.engine.seek(nextTick)
    }
  }
  /** Jump to previous death event */
  public jumpToPrevDeath(): void {
    const state = this.engine.getState()
    const deathTicks = this.logQuery.getDeathTicks()
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
}
