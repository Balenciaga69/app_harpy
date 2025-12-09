import type { DamageEvent, ICombatHook } from '@/logic/combat/logic/damage'
import { nanoid } from 'nanoid'
import type { ICombatContext } from '@/logic/combat/context'
import type { ICharacter } from '@/logic/combat/domain/character'
import { EffectNames } from '@/logic/combat/infra/config'
import type { IEffect } from '@/logic/effect-system/models/effect'
import type { IEffectServices } from '@/logic/effect-system'
/**
 * ChargedCriticalEffect
 *
 * Equipment effect: doubles critical chance if character has charge effect. Modifies DamageChain's crit check.
 */
export class ChargedCriticalEffect implements IEffect, ICombatHook {
  readonly id: string
  readonly name: string = 'Charged Critical'
  readonly cleanseOnRevive: boolean = false
  constructor() {
    this.id = `charged-crit-${nanoid(6)}`
  }
  onApply(_characterId: string, _services: IEffectServices): void {
    // Passive effect, no initialization needed
  }
  onRemove(_characterId: string, _services: IEffectServices): void {
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
