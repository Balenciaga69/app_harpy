import type { ICharacter } from '../../character'
import type { CombatContext } from '../../core/CombatContext'

export interface IEffect {
  readonly id: string
  readonly name: string
  // 當效果被添加時調用
  onApply(character: ICharacter, context: CombatContext): void
  // 當效果被移除時調用
  onRemove(character: ICharacter, context: CombatContext): void
  // 每個 Tick 調用（可選）
  onTick?(character: ICharacter, context: CombatContext): void
}
// 戰鬥 Hook 介面（責任鏈模式）
export interface ICombatHook {
  // 在傷害計算前插入修改邏輯
  //   beforeDamage?(event: DamageEvent, context: CombatContext): DamageEvent
  // 在傷害計算後插入修改邏輯
  //   afterDamage?(event: DamageEvent, context: CombatContext): void
  // 其他 Hook 點...
}
