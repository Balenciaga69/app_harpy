/**
 * ReplayConfig
 *
 * Configuration options for replay engine behavior.
 * Controls playback speed, looping, timing, and visual features.
 */
export interface ReplayConfig {
  /** Playback speed multiplier (0.5x slow, 1x normal, 2x fast, 4x very fast) */
  playbackSpeed: number
  /** Whether to loop the replay when reaching the end */
  loop: boolean
  /** Milliseconds per tick (default: 10ms matches combat tick rate) */
  msPerTick: number
  /** Whether to auto-play immediately after loading */
  autoPlay: boolean
  /** Enable smooth interpolation between snapshots for animations */
  enableInterpolation: boolean
}
/**
 * Default replay configuration
 */
export const DEFAULT_REPLAY_CONFIG: ReplayConfig = {
  playbackSpeed: 1.0,
  loop: false,
  msPerTick: 10,
  autoPlay: false,
  enableInterpolation: true,
}
