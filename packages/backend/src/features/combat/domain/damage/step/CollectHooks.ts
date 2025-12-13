import type { ICharacter } from '../../../interfaces/character/ICharacter'
import type { ICombatHook } from '../../../interfaces/damage/ICombatHook'
/**
 * collectHooks
 *
 * 收集來源與目標角色的戰鬥鉤子。
 * 從裝備、遺物、效果等收集實現 ICombatHook 的實例。
 */
export function collectHooks(source: ICharacter, target: ICharacter): ICombatHook[] {
  const hooks: ICombatHook[] = []

  /* 從來源角色收集 hooks */
  const sourceEffects = source.getAllEffects()
  for (const effect of sourceEffects) {
    if (isCombatHook(effect)) {
      hooks.push(effect)
    }
  }

  /* 從目標角色收集 hooks */
  const targetEffects = target.getAllEffects()
  for (const effect of targetEffects) {
    if (isCombatHook(effect)) {
      hooks.push(effect)
    }
  }

  return hooks
}

/** 檢查物件是否實作了 ICombatHook */
function isCombatHook(obj: unknown): obj is ICombatHook {
  if (!obj || typeof obj !== 'object') return false
  const hook = obj as Partial<ICombatHook>
  return !!(
    hook.beforeDamageCalculation ||
    hook.onHitCheck ||
    hook.onCritCheck ||
    hook.onDamageModify ||
    hook.onDefenseCalculation ||
    hook.beforeDamageApply ||
    hook.afterDamageApply
  )
}
