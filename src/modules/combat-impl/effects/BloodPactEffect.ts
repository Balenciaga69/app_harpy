import { nanoid } from 'nanoid'
import type { ICombatContext } from '@/modules/combat/context'
import type { ICharacter } from '@/modules/combat/domain/character'
import type { IEffect } from '@/modules/combat/domain/effect/models/effect'
import type { DamageEvent, ICombatHook } from '@/modules/combat/logic/damage'
/**
 * BloodPactEffect
 *
 * Applied by Blood Pact Ultimate. Multiplies damage for next N normal attacks, auto-removes when finished.
 */
export class BloodPactEffect implements IEffect, ICombatHook {
  readonly id: string
  readonly name: string = 'Blood Pact'
  private damageMultiplier: number
  private remainingAttacks: number
  constructor(damageMultiplier: number, attackCount: number) {
    this.id = `blood-pact-${nanoid(6)}`
    this.damageMultiplier = damageMultiplier
    this.remainingAttacks = attackCount
  }
  onApply(_characterId: string, _context: ICombatContext): void {
    // Passive effect, no initialization needed
  }
  onRemove(_characterId: string, _context: ICombatContext): void {
    // No cleanup needed
  }
  /**
   * [Stage 4] Damage modification stage
   * Multiply base damage if this is a normal attack
   */
  onDamageModify(event: DamageEvent, context: ICombatContext): DamageEvent {
    // Only affect attacks from the effect owner
    if (event.source.id !== this.getOwner(event)?.id) {
      return event
    }
    // Only affect normal attacks (not ultimates)
    if (event.isUltimate) {
      return event
    }
    // Check if still have remaining attacks
    if (this.remainingAttacks <= 0) {
      return event
    }
    // Apply damage multiplier to base damage amount
    event.amount *= this.damageMultiplier
    // Decrement counter
    this.remainingAttacks--
    // If no attacks remaining, remove this effect
    if (this.remainingAttacks === 0) {
      const owner = this.getOwner(event)
      if (owner) {
        // Schedule removal after this damage calculation completes
        setTimeout(() => {
          owner.removeEffect(this.id, context)
        }, 0)
      }
    }
    return event
  }
  /**
   * Helper method: Get the owner of this effect
   */
  private getOwner(event: DamageEvent): ICharacter | null {
    if (event.source.hasEffect(this.id)) {
      return event.source
    }
    return null
  }
  /**
   * Get remaining attack count (for UI display)
   */
  getRemainingAttacks(): number {
    return this.remainingAttacks
  }
}
