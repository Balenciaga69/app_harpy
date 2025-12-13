import type { ICombatContext } from '../../interfaces/context/ICombatContext'
import { IUltimateAbility } from '../../interfaces/ultimate/IUltimateAbility'
import { IUltimateManager } from '../../interfaces/ultimate/IUltimateManager'
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
