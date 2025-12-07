import type { ICharacter } from '../character/models/character'
import type { ICombatContext } from '@/logic/combat/context'
import type { IEffect } from './models/effect'
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
  /**
   * Cleanse effects that have cleanseOnRevive: true
   * Used during resurrection to remove debuffs while keeping equipment effects
   */
  cleanseCanCleanseEffects(context: ICombatContext): void {
    const effectsToRemove: string[] = []
    this.effects.forEach((effect) => {
      if (effect.cleanseOnRevive) {
        effectsToRemove.push(effect.id)
      }
    })
    effectsToRemove.forEach((effectId) => {
      this.removeEffect(effectId, context)
    })
  }
  /**
   * Trigger onHpZero hook for all effects
   * Called when character's HP reaches zero (before death/resurrection check)
   */
  triggerHpZero(context: ICombatContext): void {
    this.effects.forEach((effect) => {
      effect.onHpZero?.(this.character.id, context)
    })
  }
  /**
   * Trigger onRevive hook for all effects
   * Called after successful resurrection
   */
  triggerRevive(context: ICombatContext): void {
    this.effects.forEach((effect) => {
      effect.onRevive?.(this.character.id, context)
    })
  }
}
