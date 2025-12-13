// TODO: 依賴外部模組 @/features/effect
import { ICombatContext } from '@/features/combat/interfaces/context/ICombatContext'
import type { ICombatEffectHook } from '@/features/effect'
import { CombatEffectServices } from '../../CombatEffectServices'
import { isCharacter } from '../../../domain/TypeGuardUtil'
/**
 * EffectProcessor
 *
 * Processes effects for all characters on each tick.
 */
export class EffectProcessor {
  private context: ICombatContext
  private services: CombatEffectServices
  constructor(context: ICombatContext) {
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
