import type { CombatSnapshot } from '../../combat-engine/models'
import type { CombatContext } from '@/modules/combat/context'
import type { ICharacter } from '../../domain/character'
import { isCharacter } from '../../infra/shared'
import { CombatTiming } from '../../infra/config'
/**
 * SnapshotCollector
 *
 * Collects combat snapshots at configured intervals by listening to tick events. Stores entity states
 * for replay and analysis. Provides query and cleanup methods.
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
