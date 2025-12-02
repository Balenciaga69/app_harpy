import type { CombatContext } from '../context'
import type { CharacterId, ICharacter } from '../domain/character'
import { EnergySystem, UltimateDefaults, UltimateEnergy } from '../infra/config'
import { isCharacter } from '../infra/shared'
import { DamageChain } from '../logic/damage'
import { DamageFactory } from './factories'
import { FirstAliveSelector, type ITargetSelector } from './target-select-strategies'
/**
 * TickActionSystem
 *
 * Coordinates character attack logic per tick. Manages cooldown, energy, ultimate release, and target selection
 * using pluggable strategies. Emits attack and ultimate events.
 */
export class TickActionSystem {
  private context: CombatContext
  private damageChain: DamageChain
  private targetSelector: ITargetSelector
  private damageFactory: DamageFactory
  /** Track next attack tick for each character */
  private nextAttackTick: Map<CharacterId, number> = new Map()
  private tickHandler: () => void
  constructor(context: CombatContext, targetSelector?: ITargetSelector) {
    this.context = context
    this.damageChain = new DamageChain(context)
    this.targetSelector = targetSelector ?? new FirstAliveSelector()
    this.damageFactory = new DamageFactory()
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
    // Process global effects
    this.processEffects()
    // Iterate through all entities
    allEntities.forEach((entity) => {
      // Only process characters
      if (!isCharacter(entity)) return
      const character = entity as ICharacter
      // Skip dead characters
      if (character.isDead) return
      // Process effects for all characters
      character.getAllEffects().forEach((effect) => effect.onTick?.(character, this.context))
      // Energy natural regen (triggers every 100 ticks)
      this.processEnergyRegen(character, currentTick)
      // Check if can attack
      if (this.canAttack(character, currentTick)) {
        this.performAttack(character, currentTick)
      }
    })
  }
  /** Check if character can attack */
  private canAttack(character: ICharacter, currentTick: number): boolean {
    const nextAttack = this.nextAttackTick.get(character.id)
    // If no record, set random initial delay (0 ~ cooldown time)
    if (nextAttack === undefined) {
      const cooldown = character.getAttribute('attackCooldown')
      const randomDelay = Math.floor(this.context.rng.next() * cooldown)
      this.nextAttackTick.set(character.id, currentTick + randomDelay)
      return false
    }
    // Check if cooldown time has passed
    return currentTick >= nextAttack
  }
  /** Perform attack */
  private performAttack(character: ICharacter, currentTick: number): void {
    // 1. Get candidate targets
    const enemyTeam = character.team === 'player' ? 'enemy' : 'player'
    const enemies = this.context.getEntitiesByTeam(enemyTeam)
    const aliveEnemies = enemies.filter((e) => {
      return isCharacter(e) && !(e as ICharacter).isDead
    }) as ICharacter[]
    // 2. Use strategy to select target
    const target = this.targetSelector.selectTarget(character, aliveEnemies)
    if (!target) return
    // 3. Check if can release ultimate // TODO: This part is complex, can consider making it a separate method or even class or other architecture
    const currentEnergy = character.getAttribute('currentEnergy') ?? 0
    const maxEnergy = character.getAttribute('maxEnergy') ?? UltimateEnergy.COST
    const canUseUltimate = currentEnergy >= maxEnergy
    if (canUseUltimate) {
      // Release ultimate
      this.performUltimate(character, target, currentTick)
    } else {
      // Normal attack
      this.performNormalAttack(character, target, currentTick)
    }
    // 4. Update next attack time
    this.updateCooldown(character, currentTick)
  }
  /** Perform normal attack */
  private performNormalAttack(character: ICharacter, target: ICharacter, currentTick: number): void {
    // Send attack event
    this.context.eventBus.emit('entity:attack', {
      sourceId: character.id,
      targetId: target.id,
      tick: currentTick,
    })
    // Create normal attack damage event
    const damageEvent = this.damageFactory.createAttackEvent(character, target, currentTick)
    // Execute damage calculation
    this.damageChain.execute(damageEvent)
    // Accumulate energy after successful normal attack
    if (damageEvent.isHit && !damageEvent.prevented) {
      const energyGain = character.getAttribute('energyGainOnAttack') ?? 0
      if (energyGain > 0) {
        this.gainEnergy(character, energyGain)
      }
    }
  }
  /** Perform ultimate */
  private performUltimate(character: ICharacter, _target: ICharacter, _currentTick: number): void {
    // First consume energy
    character.setBaseAttribute('currentEnergy', 0)
    // Check if character has ultimate
    const ultimate = character.getUltimate()
    if (!ultimate) {
      // If no ultimate, use default ultimate logic (backward compatibility)
      this.performDefaultUltimate(character, _target, _currentTick)
      return
    }
    // Execute character-specific ultimate
    ultimate.execute(character, this.context)
  }
  /** Default ultimate logic (backward compatibility, used when character has no ultimate set) */
  private performDefaultUltimate(character: ICharacter, target: ICharacter, currentTick: number): void {
    // Send ultimate event
    this.context.eventBus.emit('entity:attack', {
      sourceId: character.id,
      targetId: target.id,
      tick: currentTick,
    })
    // Calculate ultimate damage (base attack * multiplier)
    const baseDamage = character.getAttribute('attackDamage') ?? 0
    const ultimateDamage = baseDamage * UltimateDefaults.defaultDamageMultiplier
    // Create ultimate damage event
    const damageEvent = this.damageFactory.createUltimateEvent(character, target, ultimateDamage, currentTick)
    // Execute damage calculation
    this.damageChain.execute(damageEvent)
  }
  /** Accumulate energy */
  private gainEnergy(character: ICharacter, amount: number): void {
    const currentEnergy = character.getAttribute('currentEnergy') ?? 0
    const maxEnergy = character.getAttribute('maxEnergy') ?? UltimateEnergy.COST
    const newEnergy = Math.min(currentEnergy + amount, maxEnergy)
    character.setBaseAttribute('currentEnergy', newEnergy)
  }
  /** Energy natural regen (triggers every 100 ticks) */
  private processEnergyRegen(character: ICharacter, currentTick: number): void {
    // Regen every 100 ticks
    if (currentTick % EnergySystem.REGEN_INTERVAL_TICKS !== 0) return
    const energyRegen = character.getAttribute('energyRegen') ?? 0
    if (energyRegen > 0) {
      this.gainEnergy(character, energyRegen)
    }
  }
  /** Update attack cooldown time */
  private updateCooldown(character: ICharacter, currentTick: number): void {
    // Get attack cooldown time (unit: Tick)
    const cooldown = character.getAttribute('attackCooldown')
    // Calculate next attack tick
    const nextAttack = currentTick + cooldown
    // Update record
    this.nextAttackTick.set(character.id, nextAttack)
  }
  /** Clean up system (remove event listeners) */
  public dispose(): void {
    this.context.eventBus.off('tick:start', this.tickHandler)
    this.nextAttackTick.clear()
  }
  /** Process effects for all characters */
  private processEffects(): void {
    this.context.getAllEntities().forEach((entity) => {
      if (!isCharacter(entity)) return
      entity.getAllEffects().forEach((effect) => effect.onTick?.(entity, this.context))
    })
  }
}
