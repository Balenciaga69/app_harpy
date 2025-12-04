import type { CombatContext } from '../../context'
import type { ICharacter } from '../../domain/character'
import { isCharacter } from '../../infra/shared'
import { EnergyManager } from '../utils/EnergyManager'
import type { ITickPhase } from './tick-phase'
/**
 * Energy Regeneration Phase
 *
 * Handles natural energy regeneration for all alive characters.
 * Energy regenerates at fixed intervals based on character attributes.
 */
export class EnergyRegenPhase implements ITickPhase {
  readonly name = 'EnergyRegen'
  private manager: EnergyManager
  constructor() {
    this.manager = new EnergyManager()
  }
  execute(context: CombatContext, tick: number): void {
    context.getAllEntities().forEach((entity) => {
      if (!isCharacter(entity)) return
      const character = entity as ICharacter
      if (character.isDead) return
      this.manager.processEnergyRegen(character, tick)
    })
  }
}
