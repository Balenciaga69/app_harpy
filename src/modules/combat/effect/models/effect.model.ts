import type { ICharacter } from '../../character'
import type { CombatContext } from '../../core/CombatContext'
import type { DamageEvent } from '../../damage'
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
// Effect 可以選擇實作這些方法來插入傷害計算流程
export interface ICombatHook {
  /** 【階段1】傷害發起階段 */
  beforeDamageCalculation?(event: DamageEvent, context: CombatContext): DamageEvent
  /** 【階段2】命中判定階段 */
  onHitCheck?(event: DamageEvent, context: CombatContext): DamageEvent
  /** 【階段3】暴擊判定階段 */
  onCritCheck?(event: DamageEvent, context: CombatContext): DamageEvent
  /** 【階段4】傷害修飾階段 */
  onDamageModify?(event: DamageEvent, context: CombatContext): DamageEvent
  /** 【階段5】防禦計算階段 */
  onDefenseCalculation?(event: DamageEvent, context: CombatContext): DamageEvent
  /** 【階段6】最終確認階段 */
  beforeDamageApply?(event: DamageEvent, context: CombatContext): DamageEvent
  /** 【階段7】傷害應用後 */
  afterDamageApply?(event: DamageEvent, context: CombatContext): void
}
