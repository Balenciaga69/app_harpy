/**
 * ReplayState
 *
 * 回放引擎目前狀態。
 * 用於管理播放進度與狀態。
 */
export interface ReplayState {
  /** Current tick position in the replay timeline */
  currentTick: number
  /** Is currently playing (not paused or stopped) */
  isPlaying: boolean
  /** Is paused (can be resumed) */
  isPaused: boolean
  /** Total ticks in this replay */
  totalTicks: number
  /** Current playback speed multiplier */
  speed: number
  /** Has reached the end of replay */
  hasEnded: boolean
  /** Is replay data loaded and ready */
  isLoaded: boolean
}
/**
 * 建立初始回放狀態
 */
export function createInitialReplayState(): ReplayState {
  return {
    currentTick: 0,
    isPlaying: false,
    isPaused: false,
    totalTicks: 0,
    speed: 1.0,
    hasEnded: false,
    isLoaded: false,
  }
}
