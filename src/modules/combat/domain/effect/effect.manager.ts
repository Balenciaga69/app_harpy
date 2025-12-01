import type { ICharacter } from '../character/interfaces/character.interface'
import type { CombatContext } from '@/modules/combat/context'
import type { IEffect } from './models/effect.model'
/**
 * EffectManager
 *
 * Manages effect instances attached to a character. Responsible for adding/removing effects, calling
 * effect lifecycle hooks (onApply/onRemove/onTick), and providing queries to inspect active effects.
 */
export class EffectManager {
  private effects: Map<string, IEffect> = new Map()
  private readonly owner: ICharacter
  constructor(owner: ICharacter) {
    this.owner = owner
  }
  /** Add effect */
  addEffect(effect: IEffect, context: CombatContext): void {
    if (this.effects.has(effect.id)) {
      return // Avoid duplicate addition
    }
    this.effects.set(effect.id, effect)
    effect.onApply(this.owner, context)
  }
  /** Remove effect */
  removeEffect(effectId: string, context: CombatContext): void {
    const effect = this.effects.get(effectId)
    if (!effect) return
    effect.onRemove(this.owner, context)
    this.effects.delete(effectId)
  }
  /** Get effect */
  getEffect(effectId: string): IEffect | undefined {
    return this.effects.get(effectId)
  }
  /** Check if has effect */
  hasEffect(effectId: string): boolean {
    return this.effects.has(effectId)
  }
  /** Get all effects */
  getAllEffects(): readonly IEffect[] {
    return Array.from(this.effects.values())
  }
  /** Call all effects each Tick */
  onTick(context: CombatContext): void {
    this.effects.forEach((effect) => {
      effect.onTick?.(this.owner, context)
    })
  }
  /** Clear all effects */
  clear(context: CombatContext): void {
    this.effects.forEach((effect) => {
      effect.onRemove(this.owner, context)
    })
    this.effects.clear()
  }
}
