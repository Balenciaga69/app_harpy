import type { IRunEventBus } from '../infra/event-bus/event-bus'
/**
 * Run Handler interface
 *
 * Base interface for all run event handlers.
 * Handlers subscribe to events via the event bus and perform their logic.
 */
export interface IRunHandler {
  /** Handler name for debugging and identification */
  readonly name: string
  /** Initialize handler and subscribe to events */
  initialize(eventBus: IRunEventBus): void
  /** Cleanup and unsubscribe from events */
  dispose(): void
}
