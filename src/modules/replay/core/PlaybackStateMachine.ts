import type { ReplayState } from '../models'
import { ReplayError } from '../models'
/**
 * PlaybackStateMachine
 *
 * State machine for managing replay playback states and transitions.
 * Enforces valid state transitions and provides immutable state access.
 *
 * Purpose:
 * - Centralize playback state management logic
 * - Enforce valid state transitions (prevent invalid operations)
 * - Separate state management from time progression logic
 * - Provide clear API for state queries and mutations
 *
 * Responsibilities:
 * - Manage state transitions (play/pause/stop/seek)
 * - Validate state changes
 * - Track playback position (currentTick)
 * - Calculate derived states (hasEnded)
 *
 * State transitions:
 * - not loaded → loaded (via markLoaded)
 * - loaded → playing (via play)
 * - playing → paused (via pause)
 * - playing → stopped (via stop)
 * - any → seeking (via seek)
 * - playing → ended (when currentTick >= totalTicks)
 */
export class PlaybackStateMachine {
  private state: ReplayState
  constructor(initialState: ReplayState) {
    this.state = { ...initialState }
  }
  /** Start playing from current position */
  public play(): void {
    if (!this.state.isLoaded) {
      throw new ReplayError('Cannot play: no data loaded', 'NOT_LOADED')
    }
    // If ended, restart from beginning
    if (this.state.hasEnded) {
      this.state.currentTick = 0
      this.state.hasEnded = false
    }
    this.state.isPlaying = true
    this.state.isPaused = false
  }
  /** Pause at current position */
  public pause(): void {
    if (!this.state.isPlaying) {
      return // Already paused or stopped
    }
    this.state.isPlaying = false
    this.state.isPaused = true
  }
  /** Stop and reset to beginning */
  public stop(): void {
    this.state.isPlaying = false
    this.state.isPaused = false
    this.state.currentTick = 0
    this.state.hasEnded = false
  }
  /** Seek to specific tick */
  public seek(tick: number): void {
    if (!this.state.isLoaded) {
      throw new ReplayError('Cannot seek: no data loaded', 'NOT_LOADED')
    }
    // Clamp tick to valid range
    const clampedTick = Math.max(0, Math.min(tick, this.state.totalTicks))
    this.state.currentTick = clampedTick
    this.state.hasEnded = clampedTick >= this.state.totalTicks
  }
  /** Advance tick by delta (called during playback) */
  public advanceTick(deltaTicks: number): void {
    const newTick = this.state.currentTick + deltaTicks
    if (newTick >= this.state.totalTicks) {
      this.state.currentTick = this.state.totalTicks
      this.state.hasEnded = true
      this.state.isPlaying = false
    } else {
      this.state.currentTick = newTick
    }
  }
  /** Set playback speed */
  public setSpeed(speed: number): void {
    if (speed <= 0 || speed > 10) {
      throw new ReplayError('Invalid speed: must be between 0 and 10', 'INVALID_SPEED', { speed })
    }
    this.state.speed = speed
  }
  /** Mark data as loaded with total ticks */
  public markLoaded(totalTicks: number): void {
    this.state.isLoaded = true
    this.state.totalTicks = totalTicks
    this.state.currentTick = 0
    this.state.hasEnded = false
    this.state.isPlaying = false
    this.state.isPaused = false
  }
  /** Get current state (immutable copy) */
  public getState(): Readonly<ReplayState> {
    return { ...this.state }
  }
  /** Get current tick */
  public getCurrentTick(): number {
    return this.state.currentTick
  }
  /** Check if currently playing */
  public isPlaying(): boolean {
    return this.state.isPlaying
  }
  /** Check if playback has ended */
  public hasEnded(): boolean {
    return this.state.hasEnded
  }
  /** Check if data is loaded */
  public isLoaded(): boolean {
    return this.state.isLoaded
  }
}
