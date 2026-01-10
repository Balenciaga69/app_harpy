import type { IEffect } from '@/features/effect/interfaces/IEffect'
import type { ICombatEffectHook, ICombatEffectServices, IEffectServices } from '@/features/effect'
import { nanoid } from 'nanoid'
/**
 * BerserkEffect
 *
 * Example effect that triggers once when health drops below threshold.
 * Grants attack bonus for the rest of the battle.
 *
 * Design pattern:
 * - Effect self-checks health in onTick()
 * - Uses internal flag to ensure single trigger per battle
 * - This is simple and efficient for 1v1 combat
 */
export class BerserkEffect implements IEffect, ICombatEffectHook {
  readonly id: string
  readonly name: string = 'Berserk'
  readonly cleanseOnRevive: boolean = false // Persists through revival
  private readonly healthThreshold: number
  private readonly attackBonus: number
  private hasTriggered: boolean = false
  private modifierId: string | null = null
  /**
   * @param healthThreshold - HP percentage threshold to trigger (e.g., 0.3 = 30%)
   * @param attackBonus - Flat attack damage bonus when triggered
   */
  constructor(healthThreshold: number = 0.3, attackBonus: number = 50) {
    this.id = `berserk-${nanoid(6)}`
    this.healthThreshold = healthThreshold
    this.attackBonus = attackBonus
  }
  onApply(_characterId: string, _services: IEffectServices): void {
    // Passive effect, waits for threshold trigger
  }
  onRemove(characterId: string, services: IEffectServices): void {
    // Clean up modifier if effect is removed
    if (this.modifierId) {
      const character = services.getCharacter(characterId)
      character.removeAttributeModifier(this.modifierId)
      this.modifierId = null
    }
  }
  onTick(characterId: string, services: ICombatEffectServices): void {
    // Already triggered this battle, skip
    if (this.hasTriggered) return
    const character = services.getCharacter(characterId)
    // Check health percentage
    const currentHp = character.getAttribute('currentHp')
    const maxHp = character.getAttribute('maxHp')
    const healthPercent = currentHp / maxHp
    // Trigger when health drops below threshold
    if (healthPercent <= this.healthThreshold) {
      this.trigger(characterId, services)
    }
  }
  private trigger(characterId: string, services: ICombatEffectServices): void {
    // Mark as triggered (only once per battle)
    this.hasTriggered = true
    const character = services.getCharacter(characterId)
    // Apply attack bonus modifier
    this.modifierId = `berserk-atk-${nanoid(4)}`
    character.addAttributeModifier({
      id: this.modifierId,
      type: 'attackDamage',
      mode: 'add',
      value: this.attackBonus,
      source: this.name,
    })
    // Emit event for logging (optional)
    services.emitEvent('effect:applied', {
      effectId: this.id,
      effectName: `${this.name} Triggered!`,
      targetId: characterId,
      tick: services.getCurrentTick(),
    })
  }
  /**
   * Called when character revives - can optionally reset trigger state
   */
  onRevive(_characterId: string, _services: IEffectServices): void {
    // Option 1: Reset trigger (can trigger again after revival)
    // this.hasTriggered = false
    // Option 2: Keep triggered state (only triggers once per battle total)
    // Do nothing - hasTriggered stays true
  }
}
