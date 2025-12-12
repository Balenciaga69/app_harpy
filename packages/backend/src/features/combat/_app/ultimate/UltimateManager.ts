import type { ICombatContext } from '@/features/combat/context'
import type { IUltimateAbility } from './ultimate-ability'
import { IUltimateManager } from './IIUltimateManager'
/**
 * UltimateManager
 *
 * Manages ultimate ability for a character.
 * Handles ultimate registration and retrieval.
 */
export class UltimateManager implements IUltimateManager {
  private ultimateId: string | null = null

  set(ultimate: IUltimateAbility, context: ICombatContext): void {
    context.registry.registerUltimate(ultimate)
    this.ultimateId = ultimate.id
  }

  get(context: ICombatContext): IUltimateAbility | undefined {
    if (!this.ultimateId) return undefined
    return context.registry.getUltimate(this.ultimateId) as IUltimateAbility | undefined
  }

  hasUltimate(): boolean {
    return this.ultimateId !== null
  }

  clear(): void {
    this.ultimateId = null
  }
}
