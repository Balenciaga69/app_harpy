import { nanoid } from 'nanoid'
import type { ICombatContext } from '@/features/combat/context'
import type { ICharacter } from '@/features/combat/character'
import { CharacterAccessor } from '@/features/combat/shared'
import { DamageChain } from '@/features/combat/damage'
import type { IUltimateAbility } from '@/features/combat/ultimate/ultimate-ability'
import { UltimateDefaults } from '@/features/combat/config'
import { FirstAliveSelector } from '@/features/combat/coordination'
import { DamageFactory } from '@/features/combat/coordination/utils/DamageFactory'
/**
 * Basic damage ultimate - concrete implementation
 *
 * Example: Deal high damage to single target
 */
export class SimpleDamageUltimate implements IUltimateAbility {
  readonly id: string
  readonly name: string
  readonly type = 'damage' as const
  private damageMultiplier: number
  constructor(name: string, damageMultiplier: number = UltimateDefaults.simpleDamageMultiplier) {
    this.id = `ultimate-${nanoid(6)}`
    this.name = name
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
