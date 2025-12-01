import type { CombatContext } from '../../context'
import { isCharacter } from '../../infra/shared'
/**
 * TickerProcessor: Specific processor for Tick events.
 *
 * Design concept:
 * - As implementation of observer pattern, listens to tick:start event and executes corresponding logic.
 * - Follows single responsibility principle, focuses on triggering Tick updates for character effects.
 * - Achieves loose coupling through event-driven approach, decoupled from TickerDriver.
 * - Provides dispose method, supports graceful cleanup and resource release of system.
 *
 * Main responsibilities:
 * - Listens to each Tick start event, automatically triggers processing logic.
 * - Iterates through all character entities, calls their effects' onTick methods.
 * - Handles updates of continuous effects (like continuous damage, periodic healing, Buff decay).
 * - Provides system cleanup method, removes event listeners to avoid memory leaks.
 */
export class TickerProcessor {
  private context: CombatContext
  private tickHandler: () => void
  constructor(context: CombatContext) {
    this.context = context
    this.tickHandler = () => this.processTick()
    this.registerEventListeners()
  }
  /** Register event listeners */
  private registerEventListeners(): void {
    // Listen to each Tick start event
    this.context.eventBus.on('tick:start', this.tickHandler)
  }
  /** Process Tick */
  private processTick(): void {
    this.context.getAllEntities().forEach((entity) => {
      if (!isCharacter(entity)) return
      entity.getAllEffects().forEach((effect) => effect.onTick?.(entity, this.context))
    })
  }
  /** Clean up system (remove event listeners) */
  public dispose(): void {
    this.context.eventBus.off('tick:start', this.tickHandler)
  }
}
