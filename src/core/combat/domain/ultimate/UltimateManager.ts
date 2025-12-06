import type { ICombatContext } from '@/core/combat/context'
import type { IUltimateAbility } from './ultimate-ability'
/**
 * UltimateManager
 *
 * Manages ultimate ability for a character.
 * Handles ultimate registration and retrieval.
 */
export class UltimateManager {
  private ultimateId: string | null = null
  /**
   * Set ultimate ability
   * Registers to registry and stores ID
   */
  set(ultimate: IUltimateAbility, context: ICombatContext): void {
    context.registry.registerUltimate(ultimate)
    this.ultimateId = ultimate.id
  }
  /**
   * Get current ultimate ability
   */
  get(context: ICombatContext): IUltimateAbility | undefined {
    if (!this.ultimateId) return undefined
    return context.registry.getUltimate(this.ultimateId) as IUltimateAbility | undefined
  }
  /**
   * Check if has ultimate
   */
  hasUltimate(): boolean {
    return this.ultimateId !== null
  }
  /**
   * Clear ultimate
   */
  clear(): void {
    this.ultimateId = null
  }
}
