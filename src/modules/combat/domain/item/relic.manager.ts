import type { ICharacter } from '../character/interfaces/character.interface'
import type { ICombatContext } from '@/modules/combat/context'
import type { Relic } from './models/relic.model'
import type { IEffect } from '../effect/models/effect.model'
/**
 * RelicManager
 *
 * Manages stackable relics for a character.
 * Relics with the same name can stack, increasing their effectiveness.
 * When adding a duplicate relic, increments stack count instead of creating new instance.
 */
export class RelicManager {
  private relics: Map<string, string> = new Map() // relicName -> relicId
  private readonly owner: ICharacter
  private readonly getRegistry: () => ICombatContext['registry']
  constructor(owner: ICharacter, getRegistry: () => ICombatContext['registry']) {
    this.owner = owner
    this.getRegistry = getRegistry
  }
  /**
   * Add a relic. If same relic exists, adds stack instead.
   */
  add(relic: Relic, context: ICombatContext): void {
    const existingRelicId = this.relics.get(relic.name)
    if (existingRelicId) {
      // Relic with same name already exists, add stack
      const existingRelic = context.registry.getRelic(existingRelicId) as Relic | undefined
      if (!existingRelic) return
      // Remove old effects before stacking
      existingRelic.getEffects().forEach((effect: IEffect) => {
        this.owner.removeEffect(effect.id, context)
      })
      // Add stack
      existingRelic.addStack()
      // Apply new effects (may have changed due to stack count)
      existingRelic.getEffects().forEach((effect: IEffect) => {
        this.owner.addEffect(effect, context)
      })
    } else {
      // New relic, register and apply effects
      context.registry.registerRelic(relic)
      this.relics.set(relic.name, relic.id)
      relic.getEffects().forEach((effect: IEffect) => {
        this.owner.addEffect(effect, context)
      })
    }
  }
  /**
   * Remove a relic completely (all stacks)
   */
  remove(relicName: string, context: ICombatContext): void {
    const relicId = this.relics.get(relicName)
    if (!relicId) return
    const relic = context.registry.getRelic(relicId) as Relic | undefined
    if (!relic) return
    // Remove all effects from this relic
    relic.getEffects().forEach((effect) => {
      this.owner.removeEffect(effect.id, context)
    })
    this.relics.delete(relicName)
  }
  /**
   * Get relic by name
   */
  getRelic(relicName: string): Relic | undefined {
    const relicId = this.relics.get(relicName)
    if (!relicId) return undefined
    return this.getRegistry().getRelic(relicId) as Relic | undefined
  }
  /**
   * Get all relics
   */
  getAllRelics(): Relic[] {
    const relics: Relic[] = []
    this.relics.forEach((relicId) => {
      const relic = this.getRegistry().getRelic(relicId) as Relic | undefined
      if (relic) relics.push(relic)
    })
    return relics
  }
  /**
   * Check if has specific relic
   */
  hasRelic(relicName: string): boolean {
    return this.relics.has(relicName)
  }
  /**
   * Get stack count of a relic
   */
  getStackCount(relicName: string): number {
    const relic = this.getRelic(relicName)
    return relic?.getStackCount() ?? 0
  }
  /**
   * Clear all relics
   */
  clear(context: ICombatContext): void {
    const relicNames = Array.from(this.relics.keys())
    relicNames.forEach((name) => {
      this.remove(name, context)
    })
  }
}
