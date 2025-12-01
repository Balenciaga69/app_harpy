import type { CharacterSnapshot } from '../../infra/shared'
/**
 * CombatSnapshot
 *
 * Records the complete combat state at a specific tick, used for replay and fast-forward.
 */
export interface CombatSnapshot {
  /** Snapshot timestamp */
  tick: number
  /** Snapshots of all characters */
  characters: CharacterSnapshot[]
}
