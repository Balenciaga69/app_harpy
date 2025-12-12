/**
 * CombatResultData
 *
 * Encapsulates all data needed to build a CombatResult, reducing constructor parameters.
 */
import type { CombatContext } from '../../context'
import type { CombatConfig } from './CombatConfig'
import type { CombatLogEntry } from '../../logger'
import type { CombatSnapshot } from './CombatSnapshot'
export interface CombatResultData {
  context: CombatContext
  config: CombatConfig
  logs: CombatLogEntry[]
  snapshots: CombatSnapshot[]
}

