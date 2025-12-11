import { nanoid } from 'nanoid'
import { StackableEffect } from '@/logic/effect-system/models/stackable-effect'
import type { ICharacterFacade, ICombatEffectServices } from '@/logic/effect-system'
/**
 * Holy fire effect
 * - Increases armor value per stack
 * - Triggers additional effects at specific stack counts (10, 20, 30, 40, 50)
 * - Maximum 50 stacks
 */
export class ExampleHolyFireEffect extends StackableEffect {
  private readonly armorPerStack: number = 10
  private modifierId: string | null = null
  constructor(initialStacks: number = 1) {
    super(`holy-fire-${nanoid(6)}`, 'Holy Fire', 50)
    this.setStacks(initialStacks)
  }
  onApply(characterId: string, services: ICombatEffectServices): void {
    const character = services.getCharacter(characterId)
    this.updateArmorModifier(character)
    this.checkThresholdEffects(character, services)
  }
  onRemove(characterId: string, services: ICombatEffectServices): void {
    const character = services.getCharacter(characterId)
    if (this.modifierId) {
      character.removeAttributeModifier(this.modifierId)
      this.modifierId = null
    }
  }
  onTick(characterId: string, services: ICombatEffectServices): void {
    const character = services.getCharacter(characterId)
    // Holy fire does not decay over time, only removed under specific conditions
    this.checkThresholdEffects(character, services)
  }
  /** Update armor modifier */
  private updateArmorModifier(character: ICharacterFacade): void {
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
  private checkThresholdEffects(character: ICharacterFacade, services: ICombatEffectServices): void {
    const thresholds = [10, 20, 30, 40, 50]
    const currentThreshold = thresholds.find((t) => this.stacks >= t) ?? 0
    // Different effects can be triggered based on different thresholds
    // For example: small heal at 10 stacks, shield at 50 stacks, etc.
    // For now, emit heal event when threshold reached
    if (currentThreshold > 0) {
      const healAmount = currentThreshold // Heal based on threshold tier
      services.emitEvent('entity:heal', {
        targetId: character.id,
        amount: healAmount,
        healType: 'effect',
        tick: services.getCurrentTick(),
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
