import type { CombatContext } from '../../context'
import { isCharacter } from '../../infra/shared'
import type { ICombatEffectHook } from '@/logic/effect-system'
import { CombatEffectServices } from '../../adapters/CombatEffectServices'
/**
 * EffectProcessor
 *
 * Processes effects for all characters on each tick.
 */
export class EffectProcessor {
  private context: CombatContext
  private services: CombatEffectServices
  constructor(context: CombatContext) {
    this.context = context
    this.services = new CombatEffectServices(context)
  }
  /** Process effects for all characters */
  processEffects(): void {
    this.context.getAllEntities().forEach((entity) => {
      if (!isCharacter(entity)) return
      entity.getAllEffects().forEach((effect) => {
        const combatHook = effect as ICombatEffectHook
        if (combatHook.onTick) {
          combatHook.onTick(entity.id, this.services)
        }
      })
    })
  }
}
