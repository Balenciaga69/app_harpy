import { Equipment } from '../../models/equipment.model'
import { LowHealthArmorEffect } from '../../../effect/Implementation/Equipment/LowHealthArmorEffect'

/**
 * Guardian's Plate - Low Health Armor
 *
 * Equipment effect:
 * - When wielder is below 30% HP, gain +20% armor
 * - Provides defensive combat hook
 */
export class GuardiansPlate extends Equipment {
  constructor() {
    super({
      name: "Guardian's Plate",
      description: 'Gain +20% armor when below 30% HP',
      rarity: 'rare',
    })
  }

  protected initializeEffects(): void {
    // Add low health armor hook effect
    this.effects.push(new LowHealthArmorEffect())
  }
}
