import { nanoid } from 'nanoid'
import { StackableEffect } from '../../models/stackable.effect.model'
import type { ICharacter } from '../../../character'
import type { CombatContext } from '../../../../context'
/**
 * Chill effect
 * - Extends enemy attack/spell cooldown time
 * - Default 4% per stack
 * - Maximum 16 stacks
 * - Decays over time
 */
export class ChillEffect extends StackableEffect {
  private readonly cooldownIncreasePerStack: number = 0.04 // 4%
  private attackModifierId: string | null = null
  private spellModifierId: string | null = null
  private readonly decayRate: number = 0.1 // Reduce 10% per second
  private lastDecayTick: number = 0
  constructor(initialStacks: number = 1) {
    super(`chill-${nanoid(6)}`, 'Chill', 16)
    this.setStacks(initialStacks)
  }
  onApply(character: ICharacter, context: CombatContext): void {
    this.lastDecayTick = context.getCurrentTick()
    this.updateCooldownModifiers(character)
  }
  onRemove(character: ICharacter, _context: CombatContext): void {
    if (this.attackModifierId) {
      character.removeAttributeModifier(this.attackModifierId)
      this.attackModifierId = null
    }
    if (this.spellModifierId) {
      character.removeAttributeModifier(this.spellModifierId)
      this.spellModifierId = null
    }
  }
  onTick(character: ICharacter, context: CombatContext): void {
    const currentTick = context.getCurrentTick()
    const ticksPassed = currentTick - this.lastDecayTick
    // Assume 100 ticks = 1 second
    const secondsPassed = ticksPassed / 100
    if (secondsPassed >= 1) {
      // Reduce 10% stacks per second or at least 1 stack
      const decayAmount = Math.max(1, Math.floor(this.stacks * this.decayRate))
      this.removeStacks(decayAmount)
      this.lastDecayTick = currentTick
      // If stacks reach zero, remove effect
      if (this.stacks === 0) {
        character.removeEffect(this.id, context)
        return
      }
      this.updateCooldownModifiers(character)
    }
  }
  /** Update cooldown modifiers (increase cooldown time) */
  private updateCooldownModifiers(character: ICharacter): void {
    // Remove old modifiers
    if (this.attackModifierId) {
      character.removeAttributeModifier(this.attackModifierId)
    }
    if (this.spellModifierId) {
      character.removeAttributeModifier(this.spellModifierId)
    }
    // Calculate cooldown increase percentage (using multiply modifier)
    const cooldownIncrease = this.stacks * this.cooldownIncreasePerStack
    // Add attack cooldown modifier
    this.attackModifierId = `${this.id}-attack-cd`
    character.addAttributeModifier({
      id: this.attackModifierId,
      type: 'attackCooldown',
      value: cooldownIncrease,
      mode: 'multiply',
      source: this.id,
    })
  }
}
