import type { IReplayEngine } from '.'
import type { CombatLogEntry, CombatResult, CombatSnapshot } from '../../combat'
import type { IReplayEventBus, ITickScheduler } from '../infra'
import { BrowserTickScheduler, ReplayEventBus } from '../infra'
import {
  DEFAULT_REPLAY_CONFIG,
  createInitialReplayState,
  type ReplayConfig,
  type ReplayEvent,
  type ReplayEventType,
  type ReplayState,
} from '../models'
import { PlaybackStateMachine } from './services/PlaybackStateMachine'
import { ReplayDataAdapter } from './services/ReplayDataAdapter'
/**
 * ReplayEngine
 *
 * 最小 API，方便 UI 整合：
 * - load(result)：載入戰鬥結果資料
 * - play() / pause() / stop()：控制播放
 * - seek(tick)：跳到指定 tick
 * - setSpeed(speed)：調整播放速度（0.5x - 3x）
 * - getState()：取得目前播放狀態
 * - on/off：訂閱重播事件
 *
 */
export class ReplayEngine implements IReplayEngine {
  private dataAdapter: ReplayDataAdapter
  private stateMachine: PlaybackStateMachine
  private eventEmitter: IReplayEventBus
  private tickScheduler: ITickScheduler
  private config: ReplayConfig
  private lastFrameTime: number = 0
  constructor(config?: Partial<ReplayConfig>, tickScheduler?: ITickScheduler) {
    this.config = { ...DEFAULT_REPLAY_CONFIG, ...config }
    this.dataAdapter = new ReplayDataAdapter()
    this.stateMachine = new PlaybackStateMachine(createInitialReplayState())
    this.eventEmitter = new ReplayEventBus()
    this.tickScheduler = tickScheduler ?? new BrowserTickScheduler()
    // Set initial speed from config (clamped to 0.5-3x)
    this.stateMachine.setSpeed(this.clampSpeed(this.config.playbackSpeed))
  }
  // === Lifecycle methods ===
  /** Load combat result data */
  public load(result: CombatResult): void {
    // Delegate data loading to adapter
    this.dataAdapter.load(result)
    // Update state machine
    this.stateMachine.markLoaded(this.dataAdapter.getTotalTicks())
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
    // Cancel any scheduled frame to avoid large delta on next tick
    this.tickScheduler.cancel()
    // Delegate seek to state machine
    this.stateMachine.seek(tick)
    // Reset time base so next tick calculation starts fresh
    this.lastFrameTime = 0
    // Emit events
    this.eventEmitter.emit('replay:seeked', this.stateMachine.getCurrentTick(), {
      fromTick,
      toTick: this.stateMachine.getCurrentTick(),
    })
    // Emit immediate tick so UI can render the new position
    this.emitTickEvent()
    // If still playing, schedule next frame to continue playback
    if (this.stateMachine.isPlaying()) {
      this.scheduleNextFrame()
    }
  }
  /** Change playback speed (clamped to 0.5x - 3x) */
  public setSpeed(speed: number): void {
    const oldSpeed = this.stateMachine.getState().speed
    const clampedSpeed = this.clampSpeed(speed)
    // Delegate speed change to state machine
    this.stateMachine.setSpeed(clampedSpeed)
    // Emit event
    this.eventEmitter.emit('replay:speedChanged', this.stateMachine.getCurrentTick(), {
      oldSpeed,
      newSpeed: clampedSpeed,
    })
  }
  /** Clamp speed to valid range (0.5x - 3x) */
  private clampSpeed(speed: number): number {
    return Math.max(0.5, Math.min(3, speed))
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
