import type { IRunEventBus } from '../infra/event-bus/event-bus'
import type { IRunHandler } from './run-handler'
/**
 * Combat Handler (Skeleton)
 *
 * Listens to room:entered events and triggers combat.
 * NOT IMPLEMENTED - This is a skeleton for future development.
 */
export class CombatHandler implements IRunHandler {
  readonly name = 'CombatHandler'
  initialize(_eventBus: IRunEventBus): void {
    // TODO: Subscribe to 'room:entered' event
    // TODO: Check if roomType is 'combat' | 'elite' | 'boss'
    // TODO: Call CombatEngine and emit 'combat:started', 'combat:ended'
    throw new Error('CombatHandler not implemented')
  }
  dispose(): void {
    // TODO: Unsubscribe from events
  }
}
