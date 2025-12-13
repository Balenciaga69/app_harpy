import type { ICombatContext } from '../../../interfaces/context/ICombatContext'
import type { ICharacter } from '../../../interfaces/character/ICharacter'
import { isCharacter } from '../../../domain/TypeGuardUtil'
import type { EnergyManager } from '../utils/EnergyManager'
import type { ITickPhase } from '../../../interfaces/tick-phases/ITickPhase'
/**
 * 能量再生階段
 *
 * 負責所有存活角色的自然(被動)能量再生。
 * 能量將依據角色屬性，以固定間隔進行再生。
 */
export class EnergyRegenPhase implements ITickPhase {
  readonly name = 'EnergyRegen'
  private manager: EnergyManager
  constructor(manager: EnergyManager) {
    this.manager = manager
  }
  execute(context: ICombatContext, tick: number): void {
    context.getAllEntities().forEach((entity) => {
      if (!isCharacter(entity)) return
      const character = entity as ICharacter
      if (character.isDead) return
      this.manager.processEnergyRegen(character, tick)
    })
  }
}
