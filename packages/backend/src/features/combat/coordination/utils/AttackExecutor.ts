import type { CombatContext } from '../../context'
import type { ICharacter } from '../../domain/character'
import { UltimateDefaults, UltimateEnergy } from '../../config'
import { isCharacter } from '../../shared'
import { DamageChain } from '../../damage'
import { EnergyManager } from './EnergyManager'
import { DamageFactory } from './DamageFactory'
import type { ITargetSelector } from '../target-select-strategies/target-selector'
/**
 * 攻擊執行器
 *
 * 負責處理攻擊邏輯，包含檢查角色是否選擇目標，並執行普通攻擊或終極技。
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
  /** 執行攻擊邏輯 */
  performAttack(character: ICharacter, currentTick: number): void {
    const enemyTeam = character.team === 'player' ? 'enemy' : 'player'
    const enemies = this.context.getEntitiesByTeam(enemyTeam)
    const aliveEnemies = enemies.filter((e) => {
      return isCharacter(e) && !(e as ICharacter).isDead
    }) as ICharacter[]
    const target = this.targetSelector.selectTarget(character, aliveEnemies)
    if (!target) return
    if (this.canUseUltimate(character)) {
      this.performUltimate(character, target, currentTick)
    } else {
      this.performNormalAttack(character, target, currentTick)
    }
  }
  /** 判斷是否能施放大招 */
  private canUseUltimate(character: ICharacter): boolean {
    const currentEnergy = character.getAttribute('currentEnergy') ?? 0
    const maxEnergy = character.getAttribute('maxEnergy') ?? UltimateEnergy.COST
    return currentEnergy >= maxEnergy
  }
  /** 執行普通攻擊邏輯 */
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
  /** 執行終極技能邏輯 */
  private performUltimate(character: ICharacter, target: ICharacter, currentTick: number): void {
    character.setBaseAttribute('currentEnergy', 0)
    const ultimate = character.getUltimate(this.context)
    if (!ultimate) {
      this.performDefaultUltimate(character, target, currentTick)
      return
    }
    ultimate.execute(character.id, this.context)
  }
  /** 執行預設終極技能行為 */
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
