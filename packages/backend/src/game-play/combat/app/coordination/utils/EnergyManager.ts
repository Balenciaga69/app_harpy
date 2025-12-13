import { EnergySystem, UltimateEnergy } from '@/game-play/combat/domain/config/CombatConstants'
import { ICharacter } from '@/game-play/combat/interfaces/character/ICharacter'
import { ICombatContext } from '@/game-play/combat/interfaces/context/ICombatContext'
/**
 * EnergyManager
 *
 * Handles energy regeneration and accumulation for characters.
 */
export class EnergyManager {
  private context: ICombatContext
  constructor(context: ICombatContext) {
    this.context = context
  }
  /** Accumulate energy for a character */
  gainEnergy(character: ICharacter, amount: number, source: 'attack' | 'regen' | 'effect' | 'item'): void {
    const currentEnergy = character.getAttribute('currentEnergy') ?? 0
    const maxEnergy = character.getAttribute('maxEnergy') ?? UltimateEnergy.COST
    const newEnergy = Math.min(currentEnergy + amount, maxEnergy)
    character.setBaseAttribute('currentEnergy', newEnergy)
    // Emit energy gained event
    this.context.eventBus.emit('energy:gained', {
      targetId: character.id,
      amount,
      source,
      currentEnergy: newEnergy,
      maxEnergy,
      tick: this.context.getCurrentTick(),
    })
  }
  /** Process natural energy regeneration (triggers every 100 ticks) */
  processEnergyRegen(character: ICharacter, currentTick: number): void {
    if (currentTick % EnergySystem.REGEN_INTERVAL_TICKS !== 0) return
    const energyRegen = character.getAttribute('energyRegen') ?? 0
    if (energyRegen > 0) {
      this.gainEnergy(character, energyRegen, 'regen')
    }
  }
}
