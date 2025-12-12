import { nanoid } from 'nanoid'
import type { ICombatContext } from '@/app/combat/context'
import { CharacterAccessor } from '@/app/combat/shared'
import type { IUltimateAbility } from '@/app/combat/domain/ultimate/ultimate-ability'
import { BloodPactEffect } from '../effects/BloodPactEffect'
/**
 * Blood Pact Ultimate
 *
 * Sacrifice HP to empower next attacks
 * - Consumes 20% of current HP
 * - Next 3 normal attacks deal 2x base damage
 * - If HP too low (< 20%), cannot activate
 */
export class ExampleBloodPactUltimate implements IUltimateAbility {
  readonly id: string
  readonly name: string
  readonly type = 'buff' as const
  private hpCostPercent: number = 0.2 // Cost 20% of current HP
  private damageMultiplier: number = 2.0 // 2x damage
  private attackCount: number = 3 // Affects next 3 attacks
  constructor(
    name: string = 'Blood Pact',
    hpCostPercent: number = 0.2,
    damageMultiplier: number = 2.0,
    attackCount: number = 3
  ) {
    this.id = `ultimate-${nanoid(6)}`
    this.name = name
    this.hpCostPercent = hpCostPercent
    this.damageMultiplier = damageMultiplier
    this.attackCount = attackCount
  }
  execute(casterId: string, context: ICombatContext): void {
    const chars = new CharacterAccessor(context)
    const caster = chars.get(casterId)
    const currentHp = caster.getAttribute('currentHp')
    const maxHp = caster.getAttribute('maxHp')
    // Check if HP is sufficient (at least 20% of max HP)
    const minHpRequired = maxHp * this.hpCostPercent
    if (currentHp < minHpRequired) {
      // Cannot activate, HP too low
      return
    }
    // 1. Consume HP
    const hpCost = currentHp * this.hpCostPercent
    caster.setCurrentHpClamped(currentHp - hpCost)
    // 2. Apply Blood Pact effect
    const bloodPactEffect = new BloodPactEffect(this.damageMultiplier, this.attackCount)
    caster.addEffect(bloodPactEffect, context)
    // 3. Emit events
    const currentTick = context.getCurrentTick()
    context.eventBus.emit('entity:attack', {
      sourceId: caster.id,
      targetId: caster.id,
      attackType: 'ultimate',
      tick: currentTick,
    })
    context.eventBus.emit('ultimate:used', {
      sourceId: caster.id,
      ultimateId: this.id,
      ultimateName: this.name,
      targetIds: [caster.id],
      tick: currentTick,
    })
  }
}
