import type { ICharacter } from '../../domain/character'
import { EnergySystem, UltimateEnergy } from '../../infra/config'
/**
 * EnergyManager
 *
 * Handles energy regeneration and accumulation for characters.
 */
export class EnergyManager {
  /** Accumulate energy for a character */
  gainEnergy(character: ICharacter, amount: number): void {
    const currentEnergy = character.getAttribute('currentEnergy') ?? 0
    const maxEnergy = character.getAttribute('maxEnergy') ?? UltimateEnergy.COST
    const newEnergy = Math.min(currentEnergy + amount, maxEnergy)
    character.setBaseAttribute('currentEnergy', newEnergy)
  }
  /** Process natural energy regeneration (triggers every 100 ticks) */
  processEnergyRegen(character: ICharacter, currentTick: number): void {
    if (currentTick % EnergySystem.REGEN_INTERVAL_TICKS !== 0) return
    const energyRegen = character.getAttribute('energyRegen') ?? 0
    if (energyRegen > 0) {
      this.gainEnergy(character, energyRegen)
    }
  }
}
