import { ICombatContext } from '../context/ICombatContext'
import type { DamageEvent } from './DamageEvent'

export interface IDamageStep {
  execute(event: DamageEvent, context: ICombatContext): boolean
}
