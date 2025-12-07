import type { DamageEvent, ICombatHook } from '@/logic/combat/logic/damage'
import { nanoid } from 'nanoid'
import type { ICombatContext } from '@/logic/combat/context'
import type { ICharacter } from '@/logic/combat/domain/character'
import type { IEffect } from '@/logic/combat/domain/effect/models/effect'
/**
 * LowHealthArmorEffect
 *
 * Equipment effect: doubles armor when health <30%. Modifies DamageChain's defense calculation.
 */
export class LowHealthArmorEffect implements IEffect, ICombatHook {
  readonly id: string
  readonly name: string = 'Crisis Armor'
  readonly cleanseOnRevive: boolean = false
  private readonly healthThreshold: number = 0.3 // 30%
  private readonly armorMultiplier: number = 2 // 2x
  constructor() {
    this.id = `low-hp-armor-${nanoid(6)}`
  }
  onApply(_characterId: string, _context: ICombatContext): void {
    // Passive effect, no initialization needed
  }
  onRemove(_characterId: string, _context: ICombatContext): void {
    // Passive effect, no cleanup needed
  }
  /**
   * [Stage 5] Defense calculation stage
   * If health below 30%, double armor value to reduce more physical damage
   */
  onDefenseCalculation(event: DamageEvent, context: ICombatContext): DamageEvent {
    // Only handle when target is self (when taking damage)
    if (event.target.id !== this.getOwner(event, context)?.id) {
      return event
    }
    // Check if health is below threshold
    const currentHp = event.target.getAttribute('currentHp')
    const maxHp = event.target.getAttribute('maxHp')
    const healthPercent = currentHp / maxHp
    if (healthPercent < this.healthThreshold) {
      // Calculate doubled armor reduction
      const baseArmor = event.target.getAttribute('armor')
      const boostedArmor = baseArmor * this.armorMultiplier
      // Calculate armor reduction percentage
      const armorReduction = boostedArmor / (boostedArmor + 100)
      // Apply additional reduction to damage
      const additionalReduction = armorReduction - baseArmor / (baseArmor + 100)
      event.amount *= 1 - additionalReduction
    }
    return event
  }
  /** Helper method: Get the owner of this effect */
  private getOwner(event: DamageEvent, _context: ICombatContext): ICharacter | null {
    // Check if source has this effect
    if (event.source.hasEffect(this.id)) {
      return event.source
    }
    // Check if target has this effect
    if (event.target.hasEffect(this.id)) {
      return event.target
    }
    return null
  }
}
