import type { CombatContext } from '../context'
import { isCharacter } from '../infra/shared'
/**
 * EffectProcessor
 *
 * Processes effects for all characters on each tick.
 */
export class EffectProcessor {
  private context: CombatContext
  constructor(context: CombatContext) {
    this.context = context
  }
  /** Process effects for all characters */
  processEffects(): void {
    this.context.getAllEntities().forEach((entity) => {
      if (!isCharacter(entity)) return
      entity.getAllEffects().forEach((effect) => effect.onTick?.(entity.id, this.context))
    })
  }
}
