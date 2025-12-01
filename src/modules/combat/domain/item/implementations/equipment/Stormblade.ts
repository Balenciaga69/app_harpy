import { Equipment } from '../../models/equipment.model'
import { ChargedCriticalEffect } from '../../../effect/Implementation/Equipment/ChargedCriticalEffect'

/**
 * Stormblade - Charged Critical Weapon
 *
 * Equipment effect:
 * - When wielder has charge status, critical chance doubles
 * - Weapon automatically provides this combat hook
 */
export class Stormblade extends Equipment {
  constructor() {
    super({
      name: 'Stormblade',
      description: 'Doubles critical chance when charged',
      rarity: 'epic',
    })
  }

  protected initializeEffects(): void {
    // Add charged critical hook effect
    this.effects.push(new ChargedCriticalEffect())
  }
}
