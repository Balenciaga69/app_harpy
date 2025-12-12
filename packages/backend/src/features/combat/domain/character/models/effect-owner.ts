import type { IEffect } from '@/features/effect-system/models/effect'
import type { ICombatContext } from '../../../context/combat-context'
/** Effect owner interface */
export interface IEffectOwner {
  // CRUD
  addEffect(effect: IEffect, context: ICombatContext): void
  removeEffect(effectId: string, context: ICombatContext): void
  hasEffect(effectId: string): boolean
  getEffect(effectId: string): IEffect | undefined
  getAllEffects(): readonly IEffect[]
  // 批量操作
  cleanseCanCleanseEffects(context: ICombatContext): void
  // 狀態觸發
  triggerHpZero(context: ICombatContext): void
  triggerRevive(context: ICombatContext): void
}
