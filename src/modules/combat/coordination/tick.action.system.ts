import type { CombatContext } from '../context'
import type { ICharacter } from '../domain/character'
import { isCharacter } from '../infra/shared'
import { FirstAliveSelector, type ITargetSelector } from './target-select-strategies'
import { EnergyManager } from './energy.manager'
import { AttackExecutor } from './attack.executor'
import { CooldownManager } from './cooldown.manager'
import { EffectProcessor } from './effect.processor'
/**
 * TickActionSystem
 *
 * Coordinates character attack logic per tick. Manages cooldown, energy, ultimate release, and target selection
 * using pluggable strategies. Emits attack and ultimate events.
 */
export class TickActionSystem {
  private context: CombatContext
  private targetSelector: ITargetSelector
  private energyManager: EnergyManager
  private attackExecutor: AttackExecutor
  private cooldownManager: CooldownManager
  private effectProcessor: EffectProcessor
  private tickHandler: () => void
  constructor(context: CombatContext, targetSelector?: ITargetSelector) {
    this.context = context
    this.targetSelector = targetSelector ?? new FirstAliveSelector()
    this.energyManager = new EnergyManager()
    this.attackExecutor = new AttackExecutor(context, this.targetSelector, this.energyManager)
    this.cooldownManager = new CooldownManager()
    this.effectProcessor = new EffectProcessor(context)
    this.tickHandler = () => this.processTick()
    this.registerEventListeners()
  }
  /** Set target selection strategy */
  setTargetSelector(selector: ITargetSelector): void {
    this.targetSelector = selector
  }
  /** Register event listeners */
  private registerEventListeners(): void {
    this.context.eventBus.on('tick:start', this.tickHandler)
  }
  /** Process ability logic for each tick */
  private processTick(): void {
    const currentTick = this.context.getCurrentTick()
    const allEntities = this.context.getAllEntities()
    this.effectProcessor.processEffects()
    allEntities.forEach((entity) => {
      if (!isCharacter(entity)) return
      const character = entity as ICharacter
      if (character.isDead) return
      this.energyManager.processEnergyRegen(character, currentTick)
      const cooldown = character.getAttribute('attackCooldown')
      if (this.cooldownManager.canAttack(character.id, currentTick, cooldown, () => this.context.rng.next())) {
        this.attackExecutor.performAttack(character, currentTick)
        this.cooldownManager.updateCooldown(character.id, currentTick, cooldown)
      }
    })
  }
  /** Clean up system (remove event listeners) */
  public dispose(): void {
    this.context.eventBus.off('tick:start', this.tickHandler)
    this.cooldownManager.clear()
  }
}
