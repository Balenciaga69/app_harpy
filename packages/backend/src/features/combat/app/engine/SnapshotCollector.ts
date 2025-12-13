import { CombatTiming } from '../../domain/config/CombatConstants'
import { ICharacter } from '../../interfaces/character/ICharacter'
import { CombatSnapshot } from '../../interfaces/combat-engine/CombatSnapshot'
import { ICombatContext } from '../../interfaces/context/ICombatContext'
import type { ISnapshotCollector } from '../../interfaces/combat-engine/ISnapshotCollector'
import { isCharacter } from '../../domain/TypeGuardUtil'
export class SnapshotCollector implements ISnapshotCollector {
  private snapshots: CombatSnapshot[] = []
  private interval: number
  private context: ICombatContext
  constructor(context: ICombatContext, interval: number = CombatTiming.DEFAULT_SNAPSHOT_INTERVAL) {
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
