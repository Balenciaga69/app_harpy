import type { IEffect } from '../../effect/models/effect'
import type { ICombatContext } from '../../../context/combat-context'
/** Effect owner interface */
export interface IEffectOwner {
  addEffect(effect: IEffect, context: ICombatContext): void
  removeEffect(effectId: string, context: ICombatContext): void
  hasEffect(effectId: string): boolean
  getEffect(effectId: string): IEffect | undefined
  getAllEffects(): readonly IEffect[]
  /** Cleanse effects with cleanseOnRevive: true (used for resurrection) */
  cleanseCanCleanseEffects(context: ICombatContext): void
  /** Trigger onHpZero hook for all effects */
  triggerHpZero(context: ICombatContext): void
  /** Trigger onRevive hook for all effects */
  triggerRevive(context: ICombatContext): void
}
