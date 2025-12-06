import { nanoid } from 'nanoid'
import type { ICombatContext } from '@/core/combat/context'
import type { ICharacter } from '@/core/combat/domain/character'
import { CharacterAccessor } from '@/core/combat/infra/shared'
import { DamageChain } from '@/core/combat/logic/damage'
import type { IUltimateAbility } from '@/core/combat/domain/ultimate/ultimate-ability'
import { UltimateDefaults } from '@/core/combat/infra/config'
import { FirstAliveSelector } from '@/core/combat/coordination'
import { DamageFactory } from '@/core/combat/coordination/utils/DamageFactory'
/**
 * Thunder Strike Ultimate
 *
 * Ultimate ability that deals damage in a small area
 * (Currently single target, area feature to be implemented)
 */
export class ExampleThunderStrikeUltimate implements IUltimateAbility {
  readonly id: string
  readonly name: string
  readonly type = 'damage' as const
  private damageMultiplier: number
  constructor(damageMultiplier: number = UltimateDefaults.thunderStrikeDamageMultiplier) {
    this.id = `ultimate-${nanoid(6)}`
    this.name = 'Thunder Strike'
    this.damageMultiplier = damageMultiplier
  }
  execute(casterId: string, context: ICombatContext): void {
    const chars = new CharacterAccessor(context)
    const caster = chars.get(casterId)
    // 1. Select target
    const enemyTeam = caster.team === 'player' ? 'enemy' : 'player'
    const enemies = context.getEntitiesByTeam(enemyTeam)
    const aliveEnemies = enemies.filter((e) => 'isDead' in e && !e.isDead) as ICharacter[]
    const selector = new FirstAliveSelector()
    const target = selector.selectTarget(caster, aliveEnemies)
    if (!target) return
    // 2. Calculate damage
    const baseDamage = caster.getAttribute('attackDamage') ?? 0
    const ultimateDamage = baseDamage * this.damageMultiplier
    // 3. Send events
    const currentTick = context.getCurrentTick()
    context.eventBus.emit('entity:attack', {
      sourceId: caster.id,
      targetId: target.id,
      attackType: 'ultimate',
      tick: currentTick,
    })
    context.eventBus.emit('ultimate:used', {
      sourceId: caster.id,
      ultimateId: this.id,
      ultimateName: this.name,
      targetIds: [target.id],
      tick: currentTick,
    })
    // 4. Create damage event and execute
    const damageFactory = new DamageFactory()
    const damageEvent = damageFactory.createUltimateEvent(caster, target, ultimateDamage, context.getCurrentTick())
    const damageChain = new DamageChain(context)
    damageChain.execute(damageEvent)
  }
}
