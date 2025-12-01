import { nanoid } from 'nanoid'
import type { ICharacter } from '../../domain/character'
import type { CombatContext } from '@/modules/combat/context'
import { DamageChain } from '../../damage'
import { DamageFactory } from '../factories'
import { FirstAliveSelector } from '../target-select-strategies'
import type { IUltimateAbility } from './ultimate.ability.interface'
/**
 * 基礎傷害型大招
 *
 * 範例：對單一目標造成高額傷害
 */
export class SimpleDamageUltimate implements IUltimateAbility {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly type = 'damage' as const
  private damageMultiplier: number
  constructor(name: string, description: string, damageMultiplier: number = 3) {
    this.id = `ultimate-${nanoid(6)}`
    this.name = name
    this.description = description
    this.damageMultiplier = damageMultiplier
  }
  execute(caster: ICharacter, context: CombatContext): void {
    // 1. 選擇目標
    const enemyTeam = caster.team === 'player' ? 'enemy' : 'player'
    const enemies = context.getEntitiesByTeam(enemyTeam)
    const aliveEnemies = enemies.filter((e) => 'isDead' in e && !e.isDead) as ICharacter[]
    const selector = new FirstAliveSelector()
    const target = selector.selectTarget(caster, aliveEnemies)
    if (!target) return
    // 2. 計算傷害
    const baseDamage = caster.getAttribute('attackDamage') ?? 0
    const ultimateDamage = baseDamage * this.damageMultiplier
    // 3. 發送事件（使用 entity:attack 事件，因為 ultimate 也是攻擊的一種）
    context.eventBus.emit('entity:attack', {
      sourceId: caster.id,
      targetId: target.id,
      tick: context.getCurrentTick(),
    })
    // 4. 創建傷害事件並執行
    const damageFactory = new DamageFactory()
    const damageEvent = damageFactory.createUltimateEvent(caster, target, ultimateDamage, context.getCurrentTick())
    const damageChain = new DamageChain(context)
    damageChain.execute(damageEvent)
  }
}
