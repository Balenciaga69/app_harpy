import type { IRunEventBus } from '../infra/event-bus/event-bus'
import type { IRunHandler } from './run-handler'
/**
 * Reward Handler (Skeleton)
 *
 * Listens to combat:victory and event:resolved events to generate rewards.
 * NOT IMPLEMENTED - This is a skeleton for future development.
 */
export class RewardHandler implements IRunHandler {
  readonly name = 'RewardHandler'
  initialize(_eventBus: IRunEventBus): void {
    // TODO: Subscribe to 'combat:victory' event
    // TODO: Subscribe to 'event:resolved' event (future)
    // TODO: Generate rewards and emit 'reward:generated'
    // TODO: Handle reward claiming and emit 'reward:claimed'
    throw new Error('RewardHandler not implemented')
  }
  dispose(): void {
    // TODO: Unsubscribe from events
  }
}
