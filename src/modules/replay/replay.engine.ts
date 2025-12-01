import type { CombatResult, CombatSnapshot } from '../combat/combat-engine/models'
import type { CombatLogEntry } from '../combat/logic/logger'
import {
  DEFAULT_REPLAY_CONFIG,
  createInitialReplayState,
  type ReplayConfig,
  type ReplayState,
  type ReplayEventType,
  type ReplayEvent,
} from './models'
import { ReplayEventEmitter } from './utils'
/**
 * ReplayEngine: Core replay system engine
 *
 * Design concept:
 * - Consumes CombatResult data and provides timeline-based playback
 * - Maintains independent state machine (loaded → playing → paused → ended)
 * - Emits events at each tick for UI to consume
 * - Supports speed control, seeking, and looping
 *
 * Key responsibilities:
 * - Load and validate combat result data
 * - Manage playback state (play/pause/stop/seek)
 * - Emit tick events with current snapshot and logs
 * - Handle time-based progression using requestAnimationFrame
 */
export class ReplayEngine {
  private result: CombatResult | null = null
  private state: ReplayState
  private config: ReplayConfig
  private eventEmitter: ReplayEventEmitter
  private animationFrameId: number | null = null
  private lastFrameTime: number = 0
  constructor(config?: Partial<ReplayConfig>) {
    this.config = { ...DEFAULT_REPLAY_CONFIG, ...config }
    this.state = createInitialReplayState()
    this.eventEmitter = new ReplayEventEmitter()
    this.state.speed = this.config.playbackSpeed
  }
  /** Load combat result data */
  public load(result: CombatResult): void {
    if (!result?.snapshots || !result?.logs) {
      throw new Error('Invalid CombatResult: missing snapshots or logs')
    }
    this.result = result
    this.state = createInitialReplayState()
    this.state.totalTicks = result.totalTicks
    this.state.isLoaded = true
    this.state.speed = this.config.playbackSpeed
    this.eventEmitter.emit('replay:loaded', 0, { totalTicks: result.totalTicks })
    if (this.config.autoPlay) {
      this.play()
    }
  }
  /** Start playback */
  public play(): void {
    if (!this.state.isLoaded) {
      // Replay data not loaded
      return
    }
    if (this.state.isPlaying) {
      return // Already playing
    }
    // If ended, restart from beginning
    if (this.state.hasEnded) {
      this.state.currentTick = 0
      this.state.hasEnded = false
    }
    this.state.isPlaying = true
    this.state.isPaused = false
    this.lastFrameTime = performance.now()
    const eventType = this.state.currentTick === 0 ? 'replay:started' : 'replay:resumed'
    this.eventEmitter.emit(eventType, this.state.currentTick, { fromTick: this.state.currentTick })
    this.scheduleNextFrame()
  }
  /** Pause playback */
  public pause(): void {
    if (!this.state.isPlaying) {
      return
    }
    this.state.isPlaying = false
    this.state.isPaused = true
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.eventEmitter.emit('replay:paused', this.state.currentTick, { atTick: this.state.currentTick })
  }
  /** Stop and reset to start */
  public stop(): void {
    this.state.isPlaying = false
    this.state.isPaused = false
    this.state.currentTick = 0
    this.state.hasEnded = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.eventEmitter.emit('replay:stopped', 0, {})
  }
  /** Seek to specific tick */
  public seek(tick: number): void {
    if (!this.state.isLoaded) {
      // Replay data not loaded
      return
    }
    const clampedTick = Math.max(0, Math.min(tick, this.state.totalTicks))
    const fromTick = this.state.currentTick
    this.state.currentTick = clampedTick
    this.state.hasEnded = clampedTick >= this.state.totalTicks
    this.eventEmitter.emit('replay:seeked', clampedTick, { fromTick, toTick: clampedTick })
    this.emitTickEvent()
  }
  /** Change playback speed */
  public setSpeed(speed: number): void {
    if (speed <= 0) {
      // Speed must be positive
      return
    }
    const oldSpeed = this.state.speed
    this.state.speed = speed
    this.eventEmitter.emit('replay:speedChanged', this.state.currentTick, { oldSpeed, newSpeed: speed })
  }
  /** Get current snapshot at current tick */
  public getCurrentSnapshot(): CombatSnapshot | null {
    if (!this.result) return null
    // Find closest snapshot at or before current tick
    const snapshots = this.result.snapshots
    let closestSnapshot: CombatSnapshot | null = null
    for (const snapshot of snapshots) {
      if (snapshot.tick <= this.state.currentTick) {
        closestSnapshot = snapshot
      } else {
        break // Snapshots are ordered, no need to continue
      }
    }
    return closestSnapshot
  }
  /** Get logs within tick range */
  public getLogsInRange(startTick: number, endTick: number): CombatLogEntry[] {
    if (!this.result) return []
    return this.result.logs.filter((log) => log.tick >= startTick && log.tick <= endTick)
  }
  /** Get logs at specific tick */
  public getLogsAtTick(tick: number): CombatLogEntry[] {
    return this.getLogsInRange(tick, tick)
  }
  /** Subscribe to replay events */
  public on(eventType: ReplayEventType, handler: (event: ReplayEvent) => void): void {
    this.eventEmitter.on(eventType, handler)
  }
  /** Unsubscribe from replay events */
  public off(eventType: ReplayEventType, handler: (event: ReplayEvent) => void): void {
    this.eventEmitter.off(eventType, handler)
  }
  /** Get current state (read-only) */
  public getState(): Readonly<ReplayState> {
    return { ...this.state }
  }
  /** Get config (read-only) */
  public getConfig(): Readonly<ReplayConfig> {
    return { ...this.config }
  }
  /** Cleanup and release resources */
  public dispose(): void {
    this.stop()
    this.eventEmitter.clear()
    this.result = null
    this.state = createInitialReplayState()
  }
  // === Private methods ===
  /** Advance tick based on elapsed time */
  private tick(currentTime: number): void {
    const deltaTime = currentTime - this.lastFrameTime
    this.lastFrameTime = currentTime
    // Calculate how many ticks should advance based on speed and time
    const ticksToAdvance = Math.floor((deltaTime * this.state.speed) / this.config.msPerTick)
    if (ticksToAdvance > 0) {
      this.state.currentTick += ticksToAdvance
      // Check if reached end
      if (this.state.currentTick >= this.state.totalTicks) {
        this.state.currentTick = this.state.totalTicks
        this.state.hasEnded = true
        this.state.isPlaying = false
        this.eventEmitter.emit('replay:ended', this.state.currentTick, { totalTicks: this.state.totalTicks })
        if (this.config.loop) {
          this.state.currentTick = 0
          this.state.hasEnded = false
          this.play()
        }
        return
      }
      this.emitTickEvent()
    }
    if (this.state.isPlaying) {
      this.scheduleNextFrame()
    }
  }
  /** Emit tick event with current state */
  private emitTickEvent(): void {
    this.eventEmitter.emit('replay:tick', this.state.currentTick, {
      currentTick: this.state.currentTick,
      deltaTime: this.config.msPerTick / this.state.speed,
    })
  }
  /** Schedule next animation frame */
  private scheduleNextFrame(): void {
    this.animationFrameId = requestAnimationFrame((time) => this.tick(time))
  }
}
