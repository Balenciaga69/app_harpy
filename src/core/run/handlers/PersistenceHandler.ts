import type { IRunEventBus } from '../infra/event-bus'
import type { IRunHandler } from './run-handler'
/**
 * Persistence Handler (Skeleton)
 *
 * Listens to run events and handles auto-saving.
 * NOT IMPLEMENTED - This is a skeleton for future development.
 */
export class PersistenceHandler implements IRunHandler {
  readonly name = 'PersistenceHandler'
  initialize(_eventBus: IRunEventBus): void {
    // TODO: Subscribe to 'floor:changed', 'reward:claimed', 'run:*' events
    // TODO: Create save snapshots
    // TODO: Emit 'save:completed' or 'save:failed'
    throw new Error('PersistenceHandler not implemented')
  }
  dispose(): void {
    // TODO: Unsubscribe from events
  }
}
