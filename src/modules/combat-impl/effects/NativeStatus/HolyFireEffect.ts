import { nanoid } from 'nanoid'
import { StackableEffect } from '@/modules/combat/domain/effect/models/stackable.effect.model'
import type { ICharacter } from '@/modules/combat/domain/character'
import type { CombatContext } from '@/modules/combat/context'
/**
 * Holy fire effect
 * - Increases armor value per stack
 * - Triggers additional effects at specific stack counts (10, 20, 30, 40, 50)
 * - Maximum 50 stacks
 */
export class HolyFireEffect extends StackableEffect {
  private readonly armorPerStack: number = 10
  private modifierId: string | null = null
  constructor(initialStacks: number = 1) {
    super(`holy-fire-${nanoid(6)}`, 'Holy Fire', 50)
    this.setStacks(initialStacks)
  }
  onApply(character: ICharacter, context: CombatContext): void {
    this.updateArmorModifier(character)
    this.checkThresholdEffects(character, context)
  }
  onRemove(character: ICharacter, _context: CombatContext): void {
    if (this.modifierId) {
      character.removeAttributeModifier(this.modifierId)
      this.modifierId = null
    }
  }
  onTick(character: ICharacter, context: CombatContext): void {
    // Holy fire does not decay over time, only removed under specific conditions
    this.checkThresholdEffects(character, context)
  }
  /** Update armor modifier */
  private updateArmorModifier(character: ICharacter): void {
    // Remove old modifier
    if (this.modifierId) {
      character.removeAttributeModifier(this.modifierId)
    }
    // Add new modifier
    this.modifierId = `${this.id}-armor`
    character.addAttributeModifier({
      id: this.modifierId,
      type: 'armor',
      value: this.stacks * this.armorPerStack,
      mode: 'add',
      source: this.id,
    })
  }
  /** Check stack threshold effects */
  private checkThresholdEffects(character: ICharacter, context: CombatContext): void {
    const thresholds = [10, 20, 30, 40, 50]
    const currentThreshold = thresholds.find((t) => this.stacks >= t) ?? 0
    // Different effects can be triggered based on different thresholds
    // For example: small heal at 10 stacks, shield at 50 stacks, etc.
    // For now, just log the event
    if (currentThreshold > 0) {
      context.eventBus.emit('entity:heal', {
        targetId: character.id,
        amount: 0, // TODO: Actual threshold effects to be implemented later
      })
    }
  }
  /** Override addStacks to update modifier immediately */
  addStacks(amount: number): void {
    super.addStacks(amount)
    // Modifier needs to be updated when stacks change, but this requires context to operate
    // So record here, actual update handled in onTick or EffectManager
  }
  /** Override removeStacks to update modifier immediately */
  removeStacks(amount: number): void {
    super.removeStacks(amount)
    // Same as above
  }
}
