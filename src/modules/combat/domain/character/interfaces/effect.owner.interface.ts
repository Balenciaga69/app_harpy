import type { IEffect } from '../../effect/models/effect.model'
import type { ICombatContext } from '../../../context'
/** Effect owner interface */
export interface IEffectOwner {
  addEffect(effect: IEffect, context: ICombatContext): void
  removeEffect(effectId: string, context: ICombatContext): void
  hasEffect(effectId: string): boolean
  getEffect(effectId: string): IEffect | undefined
  getAllEffects(): readonly IEffect[]
}
