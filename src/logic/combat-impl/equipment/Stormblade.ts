import { Equipment } from '@/logic/combat/domain/item/models/equipment'
import { ChargedCriticalEffect } from '../effects/Equipment/ChargedCriticalEffect'
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
      rarity: 'epic',
    })
  }
  protected initializeEffects(): void {
    // Add charged critical hook effect
    this.effects.push(new ChargedCriticalEffect())
  }
}
