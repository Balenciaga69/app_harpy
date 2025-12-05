// === Core Engine ===
export { ReplayEngine } from './replay-engine'
export type { IReplayEngine } from './replay-engine'
// === Models (Public API) ===
export { DEFAULT_REPLAY_CONFIG, ReplayError } from './models'
export type { ReplayConfig, ReplayEvent, ReplayEventPayloads, ReplayEventType, ReplayState } from './models'
// === Infrastructure (For DI and testing) ===
export { BrowserTickScheduler, EventBus, TestTickScheduler } from './infra'
export type { IEventBus, ITickScheduler, TickCallback } from './infra'
/**
 * Replay Module v0.4 (Simplified)
 *
 * Core features:
 * - load(result): Load combat result data
 * - play() / pause() / stop(): Control playback
 * - seek(tick): Jump to specific tick
 * - setSpeed(speed): Change playback speed (0.5x - 3x)
 * - getState(): Get current playback state
 * - on/off: Subscribe to replay events (mitt-based)
 *
 * [REMOVED in v0.4] The following were deprecated:
 * - TimelineController: Use engine.seek() and getState() directly
 * - LogQueryService: Use engine.getLogsAtTick() directly
 * - TimelineMoment type: Implement markers in UI layer
 */
