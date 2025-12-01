import type { CombatSnapshot } from '../../combat-engine/models'
import type { CombatContext } from '@/modules/combat/context'
import type { ICharacter } from '../../domain/character'
import { isCharacter } from '../../infra/shared'
import { CombatTiming } from '../../infra/config'
/**
 * SnapshotCollector: Combat snapshot collector.
 *
 * Design concept:
 * - Single responsibility: only responsible for listening to events and collecting combat status snapshots in real-time.
 * - Event-driven: receives collection timing notifications through EventBus, does not actively poll.
 * - Data authenticity: directly reads current entity status, ensures snapshots accurately reflect combat progress.
 * - Configurable interval: supports flexible collection frequency settings, balances performance and replay precision.
 * - Responsibility separation: only collects, does not participate in combat logic or result building.
 *
 * Main responsibilities:
 * - Listens to tick:start event, judges whether collection interval is reached.
 * - Reads current status of all entities from CombatContext.
 * - Generates and stores snapshot objects containing real timestamps.
 * - Provides snapshot query interface for ResultBuilder use.
 * - Provides resource cleanup method to release memory after combat ends.
 */
export class SnapshotCollector {
  private snapshots: CombatSnapshot[] = []
  private interval: number
  private context: CombatContext
  constructor(context: CombatContext, interval: number = CombatTiming.DEFAULT_SNAPSHOT_INTERVAL) {
    this.context = context
    this.interval = interval
    this.registerEventListeners()
  }
  /** Register event listeners */
  private registerEventListeners(): void {
    this.context.eventBus.on('tick:start', (payload) => {
      if (payload.tick % this.interval === 0) {
        this.captureSnapshot(payload.tick)
      }
    })
  }
  /** Capture current combat status snapshot */
  private captureSnapshot(tick: number): void {
    const allEntities = this.context.getAllEntities()
    const snapshot: CombatSnapshot = {
      tick,
      characters: allEntities.filter(isCharacter).map((character: ICharacter) => character.createSnapshot()),
    }
    this.snapshots.push(snapshot)
  }
  /** Get all collected snapshots */
  public getSnapshots(): CombatSnapshot[] {
    return this.snapshots
  }
  /** Clean up resources */
  public dispose(): void {
    this.snapshots = []
  }
}
