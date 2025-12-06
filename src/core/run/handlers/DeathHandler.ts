import type { IRunEventBus } from '../infra/event-bus/event-bus'
import type { IRunHandler } from './run-handler'
/**
 * Death Handler (Skeleton)
 *
 * Listens to combat:defeat events and handles player death/revival.
 * NOT IMPLEMENTED - This is a skeleton for future development.
 */
export class DeathHandler implements IRunHandler {
  readonly name = 'DeathHandler'
  initialize(_eventBus: IRunEventBus): void {
    // TODO: Subscribe to 'combat:defeat' event
    // TODO: Check for revival items
    // TODO: Emit 'player:died' or 'player:revived'
    // TODO: Emit 'run:game-over' if no revival
    throw new Error('DeathHandler not implemented')
  }
  dispose(): void {
    // TODO: Unsubscribe from events
  }
}
