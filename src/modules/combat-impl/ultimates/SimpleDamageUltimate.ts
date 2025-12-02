import { nanoid } from 'nanoid'
import type { ICharacter } from '@/modules/combat/domain/character'
import type { CombatContext } from '@/modules/combat/context'
import { DamageChain } from '@/modules/combat/logic/damage'
import type { IUltimateAbility } from '@/modules/combat/domain/ultimate/ultimate.ability.interface'
import { UltimateDefaults } from '@/modules/combat/infra/config'
import { DamageFactory } from '@/modules/combat/coordination/factories'
import { FirstAliveSelector } from '@/modules/combat/coordination'
/**
 * Basic damage ultimate - concrete implementation
 *
 * Example: Deal high damage to single target
 */
export class SimpleDamageUltimate implements IUltimateAbility {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly type = 'damage' as const
  private damageMultiplier: number
  constructor(name: string, description: string, damageMultiplier: number = UltimateDefaults.simpleDamageMultiplier) {
    this.id = `ultimate-${nanoid(6)}`
    this.name = name
    this.description = description
    this.damageMultiplier = damageMultiplier
  }
  execute(caster: ICharacter, context: CombatContext): void {
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
    // 3. Send event (use entity:attack event, since ultimate is also a type of attack)
    context.eventBus.emit('entity:attack', {
      sourceId: caster.id,
      targetId: target.id,
      tick: context.getCurrentTick(),
    })
    // 4. Create damage event and execute
    const damageFactory = new DamageFactory()
    const damageEvent = damageFactory.createUltimateEvent(caster, target, ultimateDamage, context.getCurrentTick())
    const damageChain = new DamageChain(context)
    damageChain.execute(damageEvent)
  }
}
