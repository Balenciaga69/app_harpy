import { nanoid } from 'nanoid'
// TODO: [Cross-layer dependency] This implementation class depends on Domain layer and Context layer
// Inherits dependency requirements from IUltimateAbility interface
import type { ICharacter } from '../../domain/character'
import type { CombatContext } from '@/modules/combat/context'
import { DamageChain } from '../../logic/damage'
import { ChargeEffect } from '../../domain/effect/Implementation'
import { DamageFactory } from '../factories'
import { FirstAliveSelector } from '../target-select-strategies'
import type { IUltimateAbility } from './ultimate.ability.interface'
/**
 * Hybrid ultimate example: Thunder Strike - concrete implementation
 *
 * Effects:
 * - Deal damage to single enemy
 * - Add charge stacks to self
 */
export class ThunderStrikeUltimate implements IUltimateAbility {
  readonly id: string
  readonly name: string = 'Thunder Strike'
  readonly description: string = 'Deal damage to enemy and add charge stacks to self'
  readonly type = 'hybrid' as const
  private damageMultiplier: number
  private chargeStacks: number
  constructor(damageMultiplier: number = 2, chargeStacks: number = 6) {
    this.id = `ultimate-thunder-${nanoid(6)}`
    this.damageMultiplier = damageMultiplier
    this.chargeStacks = chargeStacks
  }
  execute(caster: ICharacter, context: CombatContext): void {
    // === First part: Deal damage ===
    const enemyTeam = caster.team === 'player' ? 'enemy' : 'player'
    const enemies = context.getEntitiesByTeam(enemyTeam)
    const aliveEnemies = enemies.filter((e) => 'isDead' in e && !e.isDead) as ICharacter[]
    const selector = new FirstAliveSelector()
    const target = selector.selectTarget(caster, aliveEnemies)
    if (target) {
      const baseDamage = caster.getAttribute('attackDamage') ?? 0
      const ultimateDamage = baseDamage * this.damageMultiplier
      context.eventBus.emit('entity:attack', {
        sourceId: caster.id,
        targetId: target.id,
        tick: context.getCurrentTick(),
      })
      const damageFactory = new DamageFactory()
      const damageEvent = damageFactory.createUltimateEvent(caster, target, ultimateDamage, context.getCurrentTick())
      const damageChain = new DamageChain(context)
      damageChain.execute(damageEvent)
    }
    // === Second part: Add charge stacks to self ===
    const existingCharge = caster.getAllEffects().find((e) => e.name === 'Charge')
    if (existingCharge && 'addStacks' in existingCharge) {
      const stackable = existingCharge as { addStacks: (amount: number) => void }
      stackable.addStacks(this.chargeStacks)
    } else {
      const chargeEffect = new ChargeEffect(this.chargeStacks)
      caster.addEffect(chargeEffect, context)
    }
  }
}
