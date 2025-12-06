/**
 * 回放事件類型
 *
 * 回放引擎可能發出的所有事件。
 * UI 可訂閱這些事件以響應播放狀態。
 */
export type ReplayEventType =
  | 'replay:loaded' // Replay data loaded and ready
  | 'replay:started' // Started playing from beginning or after stop
  | 'replay:paused' // Paused playback
  | 'replay:resumed' // Resumed from pause
  | 'replay:stopped' // Stopped and reset to start
  | 'replay:seeked' // Jumped to specific tick
  | 'replay:ended' // Reached the end naturally
  | 'replay:tick' // Tick update (emitted every frame during playback)
  | 'replay:speedChanged' // Playback speed changed
/**
 * ReplayEvent
 *
 * 回放引擎發出的事件物件，包含類型與可選資料。
 */
export interface ReplayEvent<T = unknown> {
  /** Type of event */
  type: ReplayEventType
  /** Current tick when event occurred */
  tick: number
  /** Optional event-specific data */
  payload?: T
  /** Timestamp when event was emitted */
  timestamp: number
}
/**
 * 各事件型別對應的型別安全 payload
 */
export interface ReplayEventPayloads {
  'replay:loaded': { totalTicks: number }
  'replay:started': { fromTick: number }
  'replay:paused': { atTick: number }
  'replay:resumed': { fromTick: number }
  'replay:stopped': Record<string, never>
  'replay:seeked': { fromTick: number; toTick: number }
  'replay:ended': { totalTicks: number }
  'replay:tick': { currentTick: number; deltaTime: number }
  'replay:speedChanged': { oldSpeed: number; newSpeed: number }
}
