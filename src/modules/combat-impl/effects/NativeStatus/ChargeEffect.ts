import { nanoid } from 'nanoid'
import { StackableEffect } from '@/modules/combat/domain/effect/models/stackable.effect.model'
import type { ICombatContext } from '@/modules/combat/context'
import type { ICharacter } from '@/modules/combat/domain/character'
import { CharacterAccessor } from '@/modules/combat/infra/shared'
import { EffectNames, ChargeEffectConfig, TickConfig } from '@/modules/combat/infra/config'
/**
 * Charge effect
 * - Increases attack/spell frequency (reduces cooldown time)
 * - Default 4%/stack
 * - Max 16 stacks
 * - Decays over time
 */
export class ChargeEffect extends StackableEffect {
  private readonly cooldownReductionPerStack: number = ChargeEffectConfig.COOLDOWN_REDUCTION_PER_STACK // 4%
  private attackModifierId: string | null = null
  private spellModifierId: string | null = null
  private readonly decayRate: number = ChargeEffectConfig.DECAY_RATE_PER_SECOND // Reduce 10% per second
  private lastDecayTick: number = 0
  constructor(initialStacks: number = 1) {
    super(`charge-${nanoid(6)}`, EffectNames.CHARGE, ChargeEffectConfig.MAX_STACKS)
    this.setStacks(initialStacks)
  }
  onApply(characterId: string, context: ICombatContext): void {
    const chars = new CharacterAccessor(context)
    const character = chars.get(characterId)
    this.lastDecayTick = context.getCurrentTick()
    this.updateCooldownModifiers(character)
  }
  onRemove(characterId: string, context: ICombatContext): void {
    const chars = new CharacterAccessor(context)
    const character = chars.get(characterId)
    if (this.attackModifierId) {
      character.removeAttributeModifier(this.attackModifierId)
      this.attackModifierId = null
    }
    if (this.spellModifierId) {
      character.removeAttributeModifier(this.spellModifierId)
      this.spellModifierId = null
    }
  }
  onTick(characterId: string, context: ICombatContext): void {
    const chars = new CharacterAccessor(context)
    const character = chars.get(characterId)
    const currentTick = context.getCurrentTick()
    const ticksPassed = currentTick - this.lastDecayTick
    // Assume TickConfig.TICKS_PER_SECOND ticks = 1 second (this value can be adjusted)
    const secondsPassed = ticksPassed / TickConfig.TICKS_PER_SECOND
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
  /** Update cooldown modifiers */
  private updateCooldownModifiers(character: ICharacter): void {
    // Remove old modifiers
    if (this.attackModifierId) {
      character.removeAttributeModifier(this.attackModifierId)
    }
    if (this.spellModifierId) {
      character.removeAttributeModifier(this.spellModifierId)
    }
    // Calculate cooldown reduction percentage (using multiply modifier)
    const cooldownReduction = -(this.stacks * this.cooldownReductionPerStack)
    // Add attack cooldown modifier
    this.attackModifierId = `${this.id}-attack-cd`
    character.addAttributeModifier({
      id: this.attackModifierId,
      type: 'attackCooldown',
      value: cooldownReduction,
      mode: 'multiply',
      source: this.id,
    })
  }
}
