import type { CombatContext } from '../../context'
import type { ICharacter } from '../../domain/character'
import { UltimateDefaults, UltimateEnergy } from '../../infra/config'
import { isCharacter } from '../../infra/shared'
import { DamageChain } from '../../logic/damage'
import { EnergyManager } from './EnergyManager'
import { DamageFactory } from './DamageFactory'
import type { ITargetSelector } from '../target-select-strategies/target-selector'
/**
 * AttackExecutor
 *
 * Handles attack logic, including checking if a character selecting targets, and executing normal attacks or ultimates.
 */
export class AttackExecutor {
  private context: CombatContext
  private damageChain: DamageChain
  private targetSelector: ITargetSelector
  private damageFactory: DamageFactory
  private energyManager: EnergyManager
  constructor(context: CombatContext, targetSelector: ITargetSelector, energyManager: EnergyManager) {
    this.context = context
    this.damageChain = new DamageChain(context)
    this.targetSelector = targetSelector
    this.damageFactory = new DamageFactory()
    this.energyManager = energyManager
  }
  performAttack(character: ICharacter, currentTick: number): void {
    const enemyTeam = character.team === 'player' ? 'enemy' : 'player'
    const enemies = this.context.getEntitiesByTeam(enemyTeam)
    const aliveEnemies = enemies.filter((e) => {
      return isCharacter(e) && !(e as ICharacter).isDead
    }) as ICharacter[]
    const target = this.targetSelector.selectTarget(character, aliveEnemies)
    if (!target) return
    const currentEnergy = character.getAttribute('currentEnergy') ?? 0
    const maxEnergy = character.getAttribute('maxEnergy') ?? UltimateEnergy.COST
    const canUseUltimate = currentEnergy >= maxEnergy
    if (canUseUltimate) {
      this.performUltimate(character, target, currentTick)
    } else {
      this.performNormalAttack(character, target, currentTick)
    }
  }
  private performNormalAttack(character: ICharacter, target: ICharacter, currentTick: number): void {
    this.context.eventBus.emit('entity:attack', {
      sourceId: character.id,
      targetId: target.id,
      attackType: 'normal',
      tick: currentTick,
    })
    const damageEvent = this.damageFactory.createAttackEvent(character, target, currentTick)
    this.damageChain.execute(damageEvent)
    if (damageEvent.isHit && !damageEvent.prevented) {
      const energyGain = character.getAttribute('energyGainOnAttack') ?? 0
      if (energyGain > 0) {
        this.energyManager.gainEnergy(character, energyGain, 'attack')
      }
    }
  }
  private performUltimate(character: ICharacter, target: ICharacter, currentTick: number): void {
    character.setBaseAttribute('currentEnergy', 0)
    const ultimate = character.getUltimate(this.context)
    if (!ultimate) {
      this.performDefaultUltimate(character, target, currentTick)
      return
    }
    ultimate.execute(character.id, this.context)
  }
  private performDefaultUltimate(character: ICharacter, target: ICharacter, currentTick: number): void {
    this.context.eventBus.emit('entity:attack', {
      sourceId: character.id,
      targetId: target.id,
      attackType: 'ultimate',
      tick: currentTick,
    })
    const baseDamage = character.getAttribute('attackDamage') ?? 0
    const ultimateDamage = baseDamage * UltimateDefaults.defaultDamageMultiplier
    const damageEvent = this.damageFactory.createUltimateEvent(character, target, ultimateDamage, currentTick)
    this.damageChain.execute(damageEvent)
  }
}
