import type { ICharacter } from '../../../../domain/character/interfaces/character.interface'
import type { ICombatHook } from '../../models/combat.hook.interface'
/**
 * Collect hooks from all effects on characters
 */
export function collectHooks(...characters: ICharacter[]): ICombatHook[] {
  const hooks: ICombatHook[] = []
  for (const character of characters) {
    const effects = character.getAllEffects()
    for (const effect of effects) {
      // Check if any Hook methods are implemented
      if (
        'beforeDamageCalculation' in effect ||
        'onHitCheck' in effect ||
        'onCritCheck' in effect ||
        'onDamageModify' in effect ||
        'onDefenseCalculation' in effect ||
        'beforeDamageApply' in effect ||
        'afterDamageApply' in effect
      ) {
        hooks.push(effect as unknown as ICombatHook)
      }
    }
  }
  return hooks
}
