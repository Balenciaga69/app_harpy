import type { IUltimateAbility } from './IUltimateAbility'
import type { ICombatContext } from '../context/ICombatContext'

export interface IUltimateManager {
  set(ultimate: IUltimateAbility, context: ICombatContext): void
  get(context: ICombatContext): IUltimateAbility | undefined
  hasUltimate(): boolean
  clear(): void
}
