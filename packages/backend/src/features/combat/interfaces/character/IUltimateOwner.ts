import type { IUltimateAbility } from '../ultimate/IUltimateAbility'
import type { ICombatContext } from '../context/ICombatContext'
export interface IUltimateOwner {
  /** Get ultimate (if any) */
  getUltimate(context: ICombatContext): IUltimateAbility | undefined
  /** Set ultimate */
  setUltimate(ultimate: IUltimateAbility, context: ICombatContext): void
}
