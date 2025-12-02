/**
 * Tick callback function type
 */
export type TickCallback = (currentTime: number) => void
/**
 * ITickScheduler
 *
 * Abstraction for time-based tick scheduling.
 * Decouples replay engine from specific timing implementations (browser RAF, Node timers, etc).
 */
export interface ITickScheduler {
  /** Schedule next tick to be called with the given callback */
  schedule(callback: TickCallback): void
  /** Cancel any scheduled ticks */
  cancel(): void
  /** Check if currently scheduled */
  isScheduled(): boolean
}
