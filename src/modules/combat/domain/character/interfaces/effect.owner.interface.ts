import type { IEffect } from '../../effect/models/effect.model'
import type { CombatContext } from '../../../context/combat.context'
/** 效果擁有者介面 */
export interface IEffectOwner {
  addEffect(effect: IEffect, context: CombatContext): void
  removeEffect(effectId: string, context: CombatContext): void
  hasEffect(effectId: string): boolean
  getEffect(effectId: string): IEffect | undefined
  getAllEffects(): readonly IEffect[]
}
