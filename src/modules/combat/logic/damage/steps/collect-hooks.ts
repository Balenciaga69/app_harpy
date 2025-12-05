import type { ICharacter } from '../../../domain/character/models/character'
import type { ICombatHook } from '../models/combat-hook'
/**
 * Collect hooks from all effects on characters
 */
export function collectHooks(...characters: ICharacter[]): ICombatHook[] {
  const hooks: ICombatHook[] = []
  // Get all method keys from ICombatHook
  const hookKeys: (keyof ICombatHook)[] = [
    'beforeDamageCalculation',
    'onHitCheck',
    'onCritCheck',
    'onDamageModify',
    'onDefenseCalculation',
    'beforeDamageApply',
    'afterDamageApply',
  ]
  for (const character of characters) {
    const effects = character.getAllEffects()
    const validEffects = effects.filter((effect) =>
      hookKeys.some((key) => typeof Reflect.get(effect, key) === 'function')
    )
    for (const effect of validEffects) {
      const hook: Partial<ICombatHook> = {}
      for (const key of hookKeys) {
        const fn = Reflect.get(effect, key)
        if (typeof fn !== 'function') continue
        ;(hook as ICombatHook)[key] = fn.bind(effect)
      }
      hooks.push(hook as ICombatHook)
    }
  }
  return hooks
}
