import { ICombatContext } from '../context/ICombatContext'

export interface IUltimateAbility {
  /** Ultimate unique identifier */
  readonly id: string
  /** Ultimate name */
  readonly name: string
  /** Execute ultimate */
  execute(casterId: string, context: ICombatContext): void
}
