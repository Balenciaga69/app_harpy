/**
 * CombatResultData
 *
 * Encapsulates all data needed to build a CombatResult, reducing constructor parameters.
 */
import type { CombatContext } from '../../context'
import type { CombatConfig } from './combat-config'
import type { CombatLogEntry } from '../../logger'
import type { CombatSnapshot } from './combat-snapshot'
export interface CombatResultData {
  context: CombatContext
  config: CombatConfig
  logs: CombatLogEntry[]
  snapshots: CombatSnapshot[]
}
