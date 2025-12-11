import type { ICharacter } from '../../domain/character'
import type { IEffect } from '@/app/effect-system/models/effect'
/**
 * CombatConfig
 *
 * Defines the initial parameters for a combat session.
 */
export interface CombatConfig {
  /** Random seed for reproducible combat */
  seed?: string | number
  /** Player team */
  playerTeam: ICharacter[]
  /** Enemy team */
  enemyTeam: ICharacter[]
  /** Maximum number of ticks to prevent infinite loops */
  maxTicks?: number
  /** Interval for taking snapshots (every N ticks) */
  snapshotInterval?: number
  /** Whether to enable logging */
  enableLogging?: boolean
  /** Pre-match effects to apply to all characters at combat start (tick 0). */
  preMatchEffects?: IEffect[]
}
