import type { IUltimateAbility } from '../../ultimate'
import type { ICombatContext } from '../../context/combat-context'

export interface IUltimateOwner {
  /** Get ultimate (if any) */
  getUltimate(context: ICombatContext): IUltimateAbility | undefined
  /** Set ultimate */
  setUltimate(ultimate: IUltimateAbility, context: ICombatContext): void
}
