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
  private readonly owner: ICharacter
  constructor(owner: ICharacter) {
    this.owner = owner
  }
  /** Add effect and register to global registry */
  addEffect(effect: IEffect, context: ICombatContext): void {
    if (this.effects.has(effect.id)) {
      return // Avoid duplicate addition
    }
    // Store locally
    this.effects.set(effect.id, effect)
    // Register to global registry for tracking
    context.registry.registerEffect(effect)
    // Trigger lifecycle hook
    effect.onApply(this.owner, context)
  }
  /** Remove effect and unregister from global registry */
  removeEffect(effectId: string, context: ICombatContext): void {
    const effect = this.effects.get(effectId)
    if (!effect) return
    // Trigger lifecycle hook
    effect.onRemove(this.owner, context)
    // Remove locally
    this.effects.delete(effectId)
    // Unregister from global registry
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
      effect.onTick?.(this.owner, context)
    })
  }
  /** Clear all effects and unregister from registry */
  clear(context: ICombatContext): void {
    this.effects.forEach((effect) => {
      effect.onRemove(this.owner, context)
      context.registry.unregisterEffect(effect.id)
    })
    this.effects.clear()
  }
}
