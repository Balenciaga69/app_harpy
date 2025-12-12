/**
 * CombatResultData
 *
 * Encapsulates all data needed to build a CombatResult, reducing constructor parameters.
 */
import type { ICombatContext } from '../context/ICombatContext'
import type { CombatConfig } from './CombatConfig'
import type { CombatLogEntry } from '../logger/CombatLogEntry'
import type { CombatSnapshot } from './CombatSnapshot'
export interface CombatResultData {
  context: ICombatContext
  config: CombatConfig
  logs: CombatLogEntry[]
  snapshots: CombatSnapshot[]
}
