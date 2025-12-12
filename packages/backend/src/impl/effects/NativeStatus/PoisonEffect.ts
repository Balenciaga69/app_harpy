import type { ICombatEffectServices } from '@/features/effect'
import { StackableEffect } from '@/features/effect/interfaces/IStackableEffect'
import { nanoid } from 'nanoid'
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
  onApply(_characterId: string, services: ICombatEffectServices): void {
    this.lastDecayTick = services.getCurrentTick()
  }
  onRemove(_characterId: string, _services: ICombatEffectServices): void {
    // Nothing to clean up
  }
  onTick(characterId: string, services: ICombatEffectServices): void {
    const currentTick = services.getCurrentTick()
    // Deal true damage every tick
    this.applyPoisonDamage(characterId, services)
    // Check decay
    const ticksPassed = currentTick - this.lastDecayTick
    const secondsPassed = ticksPassed / 100 // Assume 100 ticks = 1 second
    if (secondsPassed >= 1) {
      const decayAmount = Math.max(1, Math.floor(this.stacks * this.decayRate))
      this.removeStacks(decayAmount)
      this.lastDecayTick = currentTick
      // If stacks reach zero, effect will be removed externally
    }
  }
  /** Apply poison damage */
  private applyPoisonDamage(characterId: string, services: ICombatEffectServices): void {
    const character = services.getCharacter(characterId)
    const damage = this.stacks * this.damagePerStack
    const currentTick = services.getCurrentTick()
    if (damage > 0) {
      // Directly reduce HP (true damage)
      const currentHp = character.getAttribute('currentHp')
      const newHp = Math.max(0, currentHp - damage)
      character.setCurrentHpClamped(newHp)
      // Emit damage event
      services.emitEvent('entity:damage', {
        sourceId: this.id,
        targetId: character.id,
        amount: damage,
        finalDamage: damage,
        isCritical: false,
        damageType: 'effect',
        tick: currentTick,
      })
      // Check death
      if (newHp === 0 && !character.isDead) {
        character.isDead = true
        services.emitEvent('entity:death', {
          targetId: character.id,
          killerId: this.id,
          tick: currentTick,
        })
      }
    }
  }
}
