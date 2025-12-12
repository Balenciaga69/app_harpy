import type { ICharacter } from '@/features/combat/character/models/character'
import type { ICombatHook } from '../../../_interfaces/damage/combat-hook'

/**
 * collectHooks
 *
 * 收集來源與目標角色的戰鬥鉤子。
 * 從裝備、遺物、效果等收集實現 ICombatHook 的實例。
 */
export function collectHooks(source: ICharacter, target: ICharacter): ICombatHook[] {
  const hooks: ICombatHook[] = []

  // TODO: 實現從 source 和 target 從所有 IEffect 裡面撈 各種Hook方法 只要 not null 就 push 進 hooks 陣列

  return hooks
}
