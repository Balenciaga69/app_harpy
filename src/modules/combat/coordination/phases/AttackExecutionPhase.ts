import type { CombatContext } from '../../context'
import type { ICharacter } from '../../domain/character'
import { isCharacter } from '../../infra/shared'
import type { ITargetSelector } from '../target-select-strategies/target-selector'
import { AttackExecutor } from '../utils/AttackExecutor'
import { CooldownManager } from '../utils/CooldownManager'
import { EnergyManager } from '../utils/EnergyManager'
import type { ITickPhase } from './tick-phase'
/**
 * Attack Execution Phase
 *
 * Handles attack cooldown management and execution for all alive characters.
 * Checks if characters can attack, selects targets, and performs attacks or ultimates.
 */
export class AttackExecutionPhase implements ITickPhase {
  readonly name = 'AttackExecution'
  private attackExecutor: AttackExecutor
  private cooldownManager: CooldownManager
  constructor(context: CombatContext, targetSelector: ITargetSelector) {
    const energyManager = new EnergyManager()
    this.attackExecutor = new AttackExecutor(context, targetSelector, energyManager)
    this.cooldownManager = new CooldownManager()
  }
  execute(context: CombatContext, tick: number): void {
    context.getAllEntities().forEach((entity) => {
      if (!isCharacter(entity)) return
      const character = entity as ICharacter
      if (character.isDead) return
      const cooldown = character.getAttribute('attackCooldown')
      if (this.cooldownManager.canAttack(character.id, tick, cooldown, () => context.rng.next())) {
        this.attackExecutor.performAttack(character, tick)
        this.cooldownManager.updateCooldown(character.id, tick, cooldown)
      }
    })
  }
  dispose(): void {
    this.cooldownManager.clear()
  }
}
