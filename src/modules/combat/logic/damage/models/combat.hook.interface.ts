// TODO: [跨層依賴] Logic 層依賴 Context 層的 CombatContext
// 原因：Hook 需要訪問戰鬥上下文來查詢或修改狀態
// 遷移注意：若遷移到強類型語言，需將 CombatContext 介面提升為共用契約
import type { CombatContext } from '@/modules/combat/context'
import type { DamageEvent } from '..'
/**
 * 戰鬥 Hook 介面 - 行為契約
 *
 * 定義傷害計算流程中的各個可擴展點
 * 允許角色、裝備、效果等注入自定義邏輯
 */
export interface ICombatHook {
  beforeDamageCalculation?(event: DamageEvent, context: CombatContext): DamageEvent
  onHitCheck?(event: DamageEvent, context: CombatContext): DamageEvent
  onCritCheck?(event: DamageEvent, context: CombatContext): DamageEvent
  onDamageModify?(event: DamageEvent, context: CombatContext): DamageEvent
  onDefenseCalculation?(event: DamageEvent, context: CombatContext): DamageEvent
  beforeDamageApply?(event: DamageEvent, context: CombatContext): DamageEvent
  afterDamageApply?(event: DamageEvent, context: CombatContext): void
}
