// === Core Engine ===
export type { IReplayEngine } from './replay.engine'
export { ReplayEngine } from './ReplayEngine'
// === Controllers (High-level API) ===
export { PlaybackController } from './controllers/PlaybackController'
export type { TimelineMoment } from './controllers/time-line-moment'
export { TimelineController } from './controllers/TimelineController'
// === Models (Public API) ===
export { DEFAULT_REPLAY_CONFIG, ReplayError } from './models'
export type { ReplayConfig, ReplayEvent, ReplayEventPayloads, ReplayEventType, ReplayState } from './models'
// === Infrastructure (For DI and testing) ===
export { BrowserTickScheduler, MittReplayEventEmitter, TestTickScheduler } from './infra'
export type { IReplayEventEmitter, ITickScheduler, TickCallback } from './infra'
// === Services (Advanced usage) ===
export { LogQueryService } from './services'
/**
 * Internal modules are NOT exported:
 * - adapters/ - Internal Combat data adapter
 * - core/ - Internal state machine
 * - utils/ - Deprecated utilities
 *
 * These are implementation details and should not be accessed directly.
 * All necessary functionality is exposed through ReplayEngine and controllers.
 */
