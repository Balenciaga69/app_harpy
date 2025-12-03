import type { ICharacter } from '../character/interfaces/character.interface'
import type { ICombatContext } from '@/modules/combat/context'
import type { IEffect } from './models/effect.model'
/**
 * EffectManager
 *
 * Manages effect instances attached to a character.
 * Effects are owned by the character, but also registered to the global registry for tracking.
 */
export class EffectManager {
  private effects: Map<string, IEffect> = new Map()
  private readonly character: ICharacter
  constructor(character: ICharacter) {
    this.character = character
  }
  /** Add effect and register to global registry */
  addEffect(effect: IEffect, context: ICombatContext): void {
    if (this.effects.has(effect.id)) {
      return // Avoid duplicate addition
    }
    this.effects.set(effect.id, effect)
    context.registry.registerEffect(effect)
    effect.onApply?.(this.character.id, context)
  }
  /** Remove effect and unregister from global registry */
  removeEffect(effectId: string, context: ICombatContext): void {
    const effect = this.effects.get(effectId)
    if (!effect) return
    effect.onRemove?.(this.character.id, context)
    this.effects.delete(effectId)
    context.registry.unregisterEffect(effectId)
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
  onTick(context: ICombatContext): void {
    this.effects.forEach((effect) => {
      effect.onTick?.(this.character.id, context)
    })
  }
  /** Clear all effects and unregister from registry */
  clear(context: ICombatContext): void {
    this.effects.forEach((effect) => {
      effect.onRemove?.(this.character.id, context)
      context.registry.unregisterEffect(effect.id)
    })
    this.effects.clear()
  }
}
