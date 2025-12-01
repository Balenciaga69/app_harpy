import type { ICharacter } from '../character/interfaces/character.interface'
import type { CombatContext } from '@/modules/combat/context'
import type { IEffect } from './models/effect.model'
/**
 * EffectManager: Responsible for managing all dynamic effect instances on a single character.
 *
 * Design concept:
 * - Acts as Component in ECS, focuses on lifecycle management and updating of effects.
 * - Follows strategy pattern, each effect is independent strategy entity, can be dynamically added/removed.
 * - Combined with responsibility chain pattern, effects can act as Hooks participating in combat flow (damage calculation).
 * - Achieves loose coupling through event-driven approach, ensures adding new effects doesn't require modifying this class.
 * - Provides encapsulated interface, avoids character class becoming too large, conforms to single responsibility principle.
 *
 * Main responsibilities:
 * - Add/remove effects and trigger corresponding apply/remove logic.
 * - Update all effects in each Tick, handle continuous logic.
 * - Provide effect query and check methods, support conditional judgments.
 * - Ensure effect uniqueness, avoid duplicate additions.
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
