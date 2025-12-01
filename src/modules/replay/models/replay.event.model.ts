/**
 * Replay event types
 *
 * All possible events emitted by the replay engine.
 * UI can subscribe to these events to react to playback changes.
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
 * Event object emitted by replay engine with type and optional payload.
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
 * Type-safe event payloads for specific events
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
