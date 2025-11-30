import type { ICharacter } from '../../../character'
import type { ICombatHook } from '../../models'
/**
 * 收集角色身上所有效果的 Hook
 */
export function collectHooks(...characters: ICharacter[]): ICombatHook[] {
  const hooks: ICombatHook[] = []
  for (const character of characters) {
    const effects = character.getAllEffects()
    for (const effect of effects) {
      // 檢查是否實作了任何 Hook 方法
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
