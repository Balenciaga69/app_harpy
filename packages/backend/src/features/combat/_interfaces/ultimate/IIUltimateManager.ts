import { IUltimateAbility } from '../../ultimate'
import { ICombatContext } from '../../context'

export interface IUltimateManager {
  set(ultimate: IUltimateAbility, context: ICombatContext): void
  get(context: ICombatContext): IUltimateAbility | undefined
  hasUltimate(): boolean
  clear(): void
}
