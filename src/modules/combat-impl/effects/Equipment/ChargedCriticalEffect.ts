import type { DamageEvent, ICombatHook } from '@/modules/combat/logic/damage'
import { nanoid } from 'nanoid'
import type { ICombatContext } from '@/modules/combat/context'
import type { ICharacter } from '@/modules/combat/domain/character'
import { EffectNames } from '@/modules/combat/infra/config'
import type { IEffect } from '@/modules/combat/domain/effect/models/effect.model'
/**
 * ChargedCriticalEffect
 *
 * Equipment effect: doubles critical chance if character has charge effect. Modifies DamageChain's crit check.
 */
export class ChargedCriticalEffect implements IEffect, ICombatHook {
  readonly id: string
  readonly name: string = 'Charged Critical'
  constructor() {
    this.id = `charged-crit-${nanoid(6)}`
  }
  onApply(_characterId: string, _context: ICombatContext): void {
    // Passive effect, no initialization needed
  }
  onRemove(_characterId: string, _context: ICombatContext): void {
    // Passive effect, no cleanup needed
  }
  /**
   * [Stage 3] Critical check stage
   * If character has charge effect, double critical chance
   */
  onCritCheck(event: DamageEvent, context: ICombatContext): DamageEvent {
    // Only handle when source is self
    if (event.source.id !== this.getOwner(event, context)?.id) {
      return event
    }
    // Check if has charge effect
    const hasCharge = event.source.getAllEffects().some((effect) => effect.name === EffectNames.CHARGE)
    if (hasCharge) {
      // Recalculate critical check using doubled critical chance
      const baseCritChance = event.source.getAttribute('criticalChance')
      const boostedCritChance = Math.min(1, baseCritChance * 2) // Max 100%
      event.isCrit = context.rng.next() < boostedCritChance
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
