import type { CombatResult, CombatSnapshot, CombatLogEntry } from '../../combat'
import {
  DEFAULT_REPLAY_CONFIG,
  createInitialReplayState,
  type ReplayConfig,
  type ReplayState,
  type ReplayEventType,
  type ReplayEvent,
} from '../models'
import { LogQueryService } from '../services'
import type { ITickScheduler, IEventBus } from '../infra'
import { BrowserTickScheduler, EventBus } from '../infra'
import type { IReplayEngine } from './replay.engine'
import { ReplayDataAdapter } from '../adapters'
import { PlaybackStateMachine } from '../core'
/**
 * ReplayEngine: Coordinator for replay system
 *
 * Design concept:
 * - Thin coordination layer that delegates to specialized components
 * - Does NOT contain complex business logic (delegated to adapter/state machine)
 * - Focuses on orchestrating time progression and event emission
 *
 * Architecture:
 * - ReplayDataAdapter: Isolates Combat module dependencies
 * - PlaybackStateMachine: Manages playback state transitions
 * - IEventBus: Type-safe event emission (mitt-based)
 * - ITickScheduler: Time progression abstraction (browser/test)
 * - LogQueryService: Advanced log query capabilities
 *
 * Key responsibilities:
 * - Load combat data (delegate to adapter)
 * - Coordinate playback control (delegate to state machine)
 * - Emit events at appropriate times
 * - Advance time and calculate tick progression
 * - Provide unified API for UI consumption
 */
export class ReplayEngine implements IReplayEngine {
  private dataAdapter: ReplayDataAdapter
  private stateMachine: PlaybackStateMachine
  private eventEmitter: IEventBus
  private tickScheduler: ITickScheduler
  private logQueryService: LogQueryService
  private config: ReplayConfig
  private lastFrameTime: number = 0
  constructor(config?: Partial<ReplayConfig>, tickScheduler?: ITickScheduler) {
    this.config = { ...DEFAULT_REPLAY_CONFIG, ...config }
    this.dataAdapter = new ReplayDataAdapter()
    this.stateMachine = new PlaybackStateMachine(createInitialReplayState())
    this.eventEmitter = new EventBus()
    this.tickScheduler = tickScheduler ?? new BrowserTickScheduler()
    this.logQueryService = new LogQueryService([])
    // Set initial speed from config
    this.stateMachine.setSpeed(this.config.playbackSpeed)
  }
  // === Lifecycle methods ===
  /** Load combat result data */
  public load(result: CombatResult): void {
    // Delegate data loading to adapter
    this.dataAdapter.load(result)
    // Update state machine
    this.stateMachine.markLoaded(this.dataAdapter.getTotalTicks())
    // Update log query service
    this.logQueryService.updateLogs(this.dataAdapter.getAllLogs())
    // Emit loaded event
    this.eventEmitter.emit('replay:loaded', 0, { totalTicks: this.dataAdapter.getTotalTicks() })
    // Auto-play if configured
    if (this.config.autoPlay) {
      this.play()
    }
  }
  /** Cleanup and release resources */
  public dispose(): void {
    this.tickScheduler.cancel()
    this.dataAdapter.clear()
    this.eventEmitter.clear()
    this.lastFrameTime = 0
  }
  // === Playback control ===
  /** Start playback */
  public play(): void {
    const wasEnded = this.stateMachine.hasEnded()
    const currentTick = this.stateMachine.getCurrentTick()
    // Delegate state change to state machine
    this.stateMachine.play()
    // Emit appropriate event
    const eventType = wasEnded || currentTick === 0 ? 'replay:started' : 'replay:resumed'
    this.eventEmitter.emit(eventType, this.stateMachine.getCurrentTick(), {
      fromTick: this.stateMachine.getCurrentTick(),
    })
    // Start time progression
    this.lastFrameTime = 0
    this.scheduleNextFrame()
  }
  /** Pause playback */
  public pause(): void {
    if (!this.stateMachine.isPlaying()) {
      return // Already paused
    }
    // Delegate state change to state machine
    this.stateMachine.pause()
    // Stop time progression
    this.tickScheduler.cancel()
    // Emit event
    this.eventEmitter.emit('replay:paused', this.stateMachine.getCurrentTick(), {
      atTick: this.stateMachine.getCurrentTick(),
    })
  }
  /** Stop and reset to start */
  public stop(): void {
    // Delegate state change to state machine
    this.stateMachine.stop()
    // Stop time progression
    this.tickScheduler.cancel()
    this.lastFrameTime = 0
    // Emit event
    this.eventEmitter.emit('replay:stopped', 0, {})
  }
  /** Seek to specific tick */
  public seek(tick: number): void {
    const fromTick = this.stateMachine.getCurrentTick()
    // Delegate seek to state machine
    this.stateMachine.seek(tick)
    // Emit events
    this.eventEmitter.emit('replay:seeked', this.stateMachine.getCurrentTick(), {
      fromTick,
      toTick: this.stateMachine.getCurrentTick(),
    })
    this.emitTickEvent()
  }
  /** Change playback speed */
  public setSpeed(speed: number): void {
    const oldSpeed = this.stateMachine.getState().speed
    // Delegate speed change to state machine
    this.stateMachine.setSpeed(speed)
    // Emit event
    this.eventEmitter.emit('replay:speedChanged', this.stateMachine.getCurrentTick(), {
      oldSpeed,
      newSpeed: speed,
    })
  }
  // === State queries ===
  /** Get current snapshot at current tick */
  public getCurrentSnapshot(): CombatSnapshot | null {
    return this.dataAdapter.getSnapshotAtTick(this.stateMachine.getCurrentTick())
  }
  /** Get logs within tick range */
  public getLogsInRange(startTick: number, endTick: number): CombatLogEntry[] {
    return this.dataAdapter.getLogsInRange(startTick, endTick)
  }
  /** Get logs at specific tick */
  public getLogsAtTick(tick: number): CombatLogEntry[] {
    return this.dataAdapter.getLogsAtTick(tick)
  }
  /** Get current state (read-only) */
  public getState(): Readonly<ReplayState> {
    return this.stateMachine.getState()
  }
  /** Get config (read-only) */
  public getConfig(): Readonly<ReplayConfig> {
    return { ...this.config }
  }
  // === Event subscription ===
  /** Subscribe to replay events */
  public on(eventType: ReplayEventType, handler: (event: ReplayEvent) => void): void {
    this.eventEmitter.on(eventType, handler)
  }
  /** Unsubscribe from replay events */
  public off(eventType: ReplayEventType, handler: (event: ReplayEvent) => void): void {
    this.eventEmitter.off(eventType, handler)
  }
  // === Private methods ===
  /** Advance tick based on elapsed time */
  private tick(currentTime: number): void {
    // Initialize last frame time on first tick
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = currentTime
    }
    const deltaTime = currentTime - this.lastFrameTime
    const speed = this.stateMachine.getState().speed
    const ticksToAdvance = Math.floor((deltaTime * speed) / this.config.msPerTick)
    if (ticksToAdvance > 0) {
      // Delegate tick advancement to state machine
      this.stateMachine.advanceTick(ticksToAdvance)
      this.lastFrameTime = currentTime
      // Emit tick event
      this.emitTickEvent()
    }
    // Check if playback ended
    if (this.stateMachine.hasEnded()) {
      this.handlePlaybackEnd()
      return
    }
    // Continue if still playing
    if (this.stateMachine.isPlaying()) {
      this.scheduleNextFrame()
    }
  }
  /** Emit tick event with current state */
  private emitTickEvent(): void {
    this.eventEmitter.emit('replay:tick', this.stateMachine.getCurrentTick(), {
      currentTick: this.stateMachine.getCurrentTick(),
      deltaTime: this.config.msPerTick / this.stateMachine.getState().speed,
    })
  }
  /** Handle playback end (loop or stop) */
  private handlePlaybackEnd(): void {
    this.eventEmitter.emit('replay:ended', this.stateMachine.getCurrentTick(), {
      totalTicks: this.dataAdapter.getTotalTicks(),
    })
    if (this.config.loop) {
      // Restart from beginning
      this.stateMachine.seek(0)
      this.play()
    } else {
      // Stop scheduler
      this.tickScheduler.cancel()
    }
  }
  /** Schedule next animation frame */
  private scheduleNextFrame(): void {
    this.tickScheduler.schedule((time) => this.tick(time))
  }
}
