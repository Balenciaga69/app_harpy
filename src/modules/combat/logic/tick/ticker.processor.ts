import type { CombatContext } from '../../context'
import { isCharacter } from '../../infra/shared'
/**
 * TickerProcessor
 *
 * Listens to tick:start events and triggers onTick for all character effects. Handles cleanup via dispose.
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
