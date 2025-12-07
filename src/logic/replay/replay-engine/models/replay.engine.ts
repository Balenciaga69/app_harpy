import type { CombatLogEntry, CombatResult, CombatSnapshot } from '@/logic/combat'
import type { ReplayConfig, ReplayEvent, ReplayEventType, ReplayState } from '../../models'
/**
 * IReplayEngine
 *
 * Interface for replay engine operations.
 * Enables dependency inversion and easier testing/mocking.
 */
export interface IReplayEngine {
  // === Lifecycle methods ===
  /** Load combat result data for playback */
  load(result: CombatResult): void
  /** Cleanup and release resources */
  dispose(): void
  // === Playback control ===
  /** Start or resume playback */
  play(): void
  /** Pause playback */
  pause(): void
  /** Stop and reset to beginning */
  stop(): void
  /** Seek to specific tick */
  seek(tick: number): void
  /** Change playback speed */
  setSpeed(speed: number): void
  // === State queries ===
  /** Get current state (read-only) */
  getState(): Readonly<ReplayState>
  /** Get configuration (read-only) */
  getConfig(): Readonly<ReplayConfig>
  /** Get current snapshot at current tick */
  getCurrentSnapshot(): CombatSnapshot | null
  /** Get logs within tick range */
  getLogsInRange(startTick: number, endTick: number): CombatLogEntry[]
  /** Get logs at specific tick */
  getLogsAtTick(tick: number): CombatLogEntry[]
  // === Event subscription ===
  /** Subscribe to replay events */
  on(eventType: ReplayEventType, handler: (event: ReplayEvent) => void): void
  /** Unsubscribe from replay events */
  off(eventType: ReplayEventType, handler: (event: ReplayEvent) => void): void
}
