import { nanoid } from 'nanoid'
import type { ICharacter } from '../../character'
import type { CombatContext } from '../../context'
import { DamageChain } from '../../damage'
import { ChargeEffect } from '../../effect/Implementation'
import { DamageFactory } from '../factories'
import { FirstAliveSelector } from '../strategies'
import type { IUltimateAbility } from './ultimate.ability.interface'
/**
 * 混合型大招範例：雷霆衝擊
 *
 * 效果：
 * - 對單一敵人造成傷害
 * - 為自己疊加充能層數
 */
export class ThunderStrikeUltimate implements IUltimateAbility {
  readonly id: string
  readonly name: string = '雷霆衝擊'
  readonly description: string = '對敵人造成傷害，並為自己疊加充能'
  readonly type = 'hybrid' as const
  private damageMultiplier: number
  private chargeStacks: number
  constructor(damageMultiplier: number = 2, chargeStacks: number = 6) {
    this.id = `ultimate-thunder-${nanoid(6)}`
    this.damageMultiplier = damageMultiplier
    this.chargeStacks = chargeStacks
  }
  execute(caster: ICharacter, context: CombatContext): void {
    // === 第一部分：造成傷害 ===
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
    // === 第二部分：為自己疊加充能 ===
    const existingCharge = caster.getAllEffects().find((e) => e.name === '充能')
    if (existingCharge && 'addStacks' in existingCharge) {
      const stackable = existingCharge as { addStacks: (amount: number) => void }
      stackable.addStacks(this.chargeStacks)
    } else {
      const chargeEffect = new ChargeEffect(this.chargeStacks)
      caster.addEffect(chargeEffect, context)
    }
  }
}
