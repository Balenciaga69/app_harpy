import { Relic } from '@/modules/combat/domain/item/models/relic.model'
import { PoisonEffect } from '../effects/NativeStatus/PoisonEffect'
/**
 * Poison Vial - Stackable Poison Relic
 *
 * Relic effect:
 * - Applies poison status to wielder's attacks
 * - Each stack adds one poison effect instance
 * - Stacks independently (each provides separate poison application)
 */
export class PoisonVial extends Relic {
  constructor() {
    super({
      name: 'Poison Vial',
      rarity: 'common',
    })
  }
  protected initializeEffects(): void {
    // Each stack provides one poison effect
    // Multiple stacks mean multiple poison applications
    for (let i = 0; i < this.getStackCount(); i++) {
      this.effects.push(new PoisonEffect(1))
    }
  }
  protected onStackChanged(): void {
    // Refresh all effects when stack count changes
    this.effects = []
    this.initializeEffects()
  }
}
