/**
 * ReplayConfig (v0.4)
 *
 * 回放引擎設定。
 * 控制播放速度、循環、tick 間隔等。
 */
export interface ReplayConfig {
  /** Playback speed multiplier (0.5x - 3x, default: 1x) */
  playbackSpeed: number
  /** Whether to loop the replay when reaching the end */
  loop: boolean
  /** Milliseconds per tick (default: 10ms matches combat tick rate) */
  msPerTick: number
  /** Whether to auto-play immediately after loading */
  autoPlay: boolean
}
/**
 * Default replay configuration
 */
export const DEFAULT_REPLAY_CONFIG: ReplayConfig = {
  playbackSpeed: 1.0,
  loop: false,
  msPerTick: 10,
  autoPlay: false,
}
