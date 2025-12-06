import type { ReplayState } from '../models'
import { ReplayError } from '../models'
/**
 * PlaybackStateMachine
 *
 * 回放狀態機，管理重播的狀態與切換。
 * 保證狀態合法、提供不可變狀態查詢。
 *
 * 主要用途：
 * - 集中管理回放狀態
 * - 保證狀態切換合法
 * - 狀態管理與時間推進分離
 * - 提供明確 API 查詢/操作
 *
 * 主要職責：
 * - 管理 play/pause/stop/seek 狀態切換
 * - 驗證狀態變化
 * - 記錄目前 tick
 * - 計算 hasEnded 等衍生狀態
 *
 * 狀態轉換：
 * - 未載入 → 已載入 (markLoaded)
 * - 已載入 → 播放中 (play)
 * - 播放中 → 暫停 (pause)
 * - 播放中 → 停止 (stop)
 * - 任意 → 跳轉 (seek)
 * - 播放中 → 結束 (currentTick >= totalTicks)
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
  /** Set playback speed (clamped to 0.5x - 3x) */
  public setSpeed(speed: number): void {
    // Clamp to valid range instead of throwing
    const clampedSpeed = Math.max(0.5, Math.min(3, speed))
    this.state.speed = clampedSpeed
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
