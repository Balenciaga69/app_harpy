import type { ICharacter } from '../../domain/character'
import type { CombatLogEntry } from '../../logic/logger'
import type { CombatOutcome } from './combat.outcome.model'
import type { CombatSnapshot } from './combat.snapshot.model'
import type { CombatStatistics } from './combat.statistics.model'
/**
 * CombatResult
 *
 * Result data produced by the combat engine.
 * Used by the UI, replay system, and any code that needs final combat info.
 */
export interface CombatResult {
  // The outcome of the combat (win, loss, draw, etc.)
  outcome: CombatOutcome
  // Which side won: 'player', 'enemy', or null for no winner
  winner: 'player' | 'enemy' | null
  // Characters that survived the combat
  survivors: ICharacter[]
  // Total ticks the combat lasted
  totalTicks: number
  // Ordered list of combat log entries (useful for replay and debugging)
  logs: CombatLogEntry[]
  // Periodic snapshots captured during combat (for replay or inspection)
  snapshots: CombatSnapshot[]
  // Aggregated statistics about the combat (damage done, kills, etc.)
  statistics: CombatStatistics
  // Tick when the combat started
  startedAt: number
  // Tick when the combat ended
  endedAt: number
}
