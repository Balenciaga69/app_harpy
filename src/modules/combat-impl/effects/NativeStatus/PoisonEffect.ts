import { nanoid } from 'nanoid'
import { StackableEffect } from '@/modules/combat/domain/effect/models/stackable.effect.model'
import type { ICharacter } from '@/modules/combat/domain/character'
import type { CombatContext } from '@/modules/combat/context'
/**
 * Poison effect
 * - Deals fixed damage per stack per tick
 * - True damage (ignores armor and evasion)
 * - Theoretically unlimited stacks
 * - Reduces 10% stacks per second or at least 1 stack
 */
export class PoisonEffect extends StackableEffect {
  private readonly damagePerStack: number = 1
  private readonly decayRate: number = 0.1
  private lastDecayTick: number = 0
  constructor(initialStacks: number = 1) {
    super(`poison-${nanoid(6)}`, 'Poison', undefined)
    this.setStacks(initialStacks)
  }
  onApply(_character: ICharacter, context: CombatContext): void {
    this.lastDecayTick = context.getCurrentTick()
  }
  onRemove(_character: ICharacter, _context: CombatContext): void {
    // No cleanup needed
  }
  onTick(character: ICharacter, context: CombatContext): void {
    const currentTick = context.getCurrentTick()
    // Deal true damage every tick
    this.applyPoisonDamage(character, context)
    // Check decay
    const ticksPassed = currentTick - this.lastDecayTick
    const secondsPassed = ticksPassed / 100 // Assume 100 ticks = 1 second
    if (secondsPassed >= 1) {
      const decayAmount = Math.max(1, Math.floor(this.stacks * this.decayRate))
      this.removeStacks(decayAmount)
      this.lastDecayTick = currentTick
      if (this.stacks === 0) {
        character.removeEffect(this.id, context)
      }
    }
  }
  /** Apply poison damage */
  private applyPoisonDamage(character: ICharacter, context: CombatContext): void {
    const damage = this.stacks * this.damagePerStack
    if (damage > 0) {
      // Directly reduce HP (true damage)
      const currentHp = character.getAttribute('currentHp')
      const newHp = Math.max(0, currentHp - damage)
      character.setCurrentHpClamped(newHp)
      // Emit damage event
      context.eventBus.emit('entity:damage', {
        targetId: character.id,
        amount: damage,
        sourceId: this.id,
      })
      // Check death
      if (newHp === 0 && !character.isDead) {
        character.isDead = true
        context.eventBus.emit('entity:death', {
          targetId: character.id,
        })
      }
    }
  }
}
