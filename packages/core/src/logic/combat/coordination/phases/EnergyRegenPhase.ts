import type { CombatContext } from '../../context'
import type { ICharacter } from '../../domain/character'
import { isCharacter } from '../../infra/shared'
import { EnergyManager } from '../utils/EnergyManager'
import type { ITickPhase } from './tick-phase'
/**
 * 能量再生階段
 *
 * 負責所有存活角色的自然(被動)能量再生。
 * 能量將依據角色屬性，以固定間隔進行再生。
 */
export class EnergyRegenPhase implements ITickPhase {
  readonly name = 'EnergyRegen'
  private manager: EnergyManager
  constructor(context: CombatContext) {
    this.manager = new EnergyManager(context)
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
