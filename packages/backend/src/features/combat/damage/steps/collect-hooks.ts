import type { IEffect } from '@/app/effect-system/models/effect'
import type { ICharacter } from '../../domain/character/models/character'
import type { ICombatHook } from '../models/combat-hook'
/**
 * 取得所有 hook 的方法名稱
 */
function getHookKeys(): (keyof ICombatHook)[] {
  return [
    'beforeDamageCalculation',
    'onHitCheck',
    'onCritCheck',
    'onDamageModify',
    'onDefenseCalculation',
    'beforeDamageApply',
    'afterDamageApply',
  ]
}
/**
 * 篩選出有實作 hook 方法的效果
 */
function filterValidEffects(effects: readonly IEffect[], hookKeys: (keyof ICombatHook)[]): object[] {
  return effects.filter((effect) => hookKeys.some((key) => typeof Reflect.get(effect, key) === 'function'))
}
/**
 * 將 hook 方法綁定到效果實例
 */
function bindHooksToEffect(effect: object, hookKeys: (keyof ICombatHook)[]): ICombatHook {
  const hook: Partial<ICombatHook> = {}
  for (const key of hookKeys) {
    const fn = Reflect.get(effect, key)
    if (typeof fn !== 'function') continue
    ;(hook as ICombatHook)[key] = fn.bind(effect)
  }
  return hook as ICombatHook
}
/**
 * 收集所有角色的效果 hook
 */
export function collectHooks(...characters: ICharacter[]): ICombatHook[] {
  const hooks: ICombatHook[] = []
  const hookKeys = getHookKeys()
  for (const character of characters) {
    const effects = character.getAllEffects()
    const validEffects = filterValidEffects(effects, hookKeys)
    for (const effect of validEffects) {
      hooks.push(bindHooksToEffect(effect, hookKeys))
    }
  }
  return hooks
}
