import type { IRunEventBus } from '../infra/event-bus'
import type { IRunHandler } from './run-handler'
/**
 * Difficulty Handler (Skeleton)
 *
 * Listens to floor:changed events and updates difficulty multiplier.
 * NOT IMPLEMENTED - This is a skeleton for future development.
 */
export class DifficultyHandler implements IRunHandler {
  readonly name = 'DifficultyHandler'
  initialize(_eventBus: IRunEventBus): void {
    // TODO: Subscribe to 'floor:changed' event
    // TODO: Calculate difficulty multiplier based on floor/chapter
    // TODO: Emit 'difficulty:updated' event
    throw new Error('DifficultyHandler not implemented')
  }
  dispose(): void {
    // TODO: Unsubscribe from events
  }
}
