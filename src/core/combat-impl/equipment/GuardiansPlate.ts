import { Equipment } from '@/core/combat/domain/item/models/equipment'
import { LowHealthArmorEffect } from '../effects/Equipment/LowHealthArmorEffect'
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
      rarity: 'rare',
    })
  }
  protected initializeEffects(): void {
    // Add low health armor hook effect
    this.effects.push(new LowHealthArmorEffect())
  }
}
