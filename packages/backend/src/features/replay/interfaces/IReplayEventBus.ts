import type { IEventBus } from '../../shared/event-bus/IEventBus'
import type { ReplayEvent, ReplayEventType } from './ReplayEvent'

/**
 * Replay Event Bus Interface
 *
 * Specialized event bus for replay module.
 * Implements the shared IEventBus for compatibility.
 */
export interface IReplayEventBus extends IEventBus<Record<ReplayEventType, ReplayEvent>> {
  /** Emit event with tick context (convenience method) */
  emitWithTick(eventType: ReplayEventType, tick: number, payload?: unknown): void
}
