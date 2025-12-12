import type { CombatSnapshot } from '../combat-engine/models'
import type { CombatContext } from '@/features/combat'
import type { ICharacter } from '../character'
import { isCharacter } from '../shared'
import { CombatTiming } from '../config'

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
