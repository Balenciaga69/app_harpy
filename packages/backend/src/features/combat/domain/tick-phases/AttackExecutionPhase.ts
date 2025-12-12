import type { ICombatContext } from '../../interfaces/context/ICombatContext'
import type { ICharacter } from '../../interfaces/character/ICharacter'
import { isCharacter } from '../../app/shared/utils/TypeGuardUtil'
// TODO: 這些 util 類別應該透過 interface 注入，而非直接引用實作
import type { AttackExecutor } from '../../app/coordination/utils/AttackExecutor'
import type { CooldownManager } from '../../app/coordination/utils/CooldownManager'
import type { ITickPhase } from '../../interfaces/tick-phases/ITickPhase'
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
  constructor(attackExecutor: AttackExecutor, cooldownManager: CooldownManager) {
    this.attackExecutor = attackExecutor
    this.cooldownManager = cooldownManager
  }
  execute(context: ICombatContext, tick: number): void {
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
