import { EventBus } from '../infra/event-bus'
import { CombatRandomGenerator, type IEntity } from '../infra/shared'
/**
 * CombatContext
 *
 * Holds global resources for combat: event bus, RNG, entity list, and current tick. Provides read/write
 * access for systems to share state and coordinate combat progress.
 */
export class CombatContext {
  public readonly eventBus: EventBus
  public readonly rng: CombatRandomGenerator
  private currentTick: number = 0
  private entities: Map<string, IEntity> = new Map()
  constructor(seed?: string | number) {
    this.eventBus = new EventBus()
    this.rng = new CombatRandomGenerator(seed)
  }
  // ===Entity===
  public getEntity(id: string): IEntity | undefined {
    return this.entities.get(id)
  }
  public addEntity(entity: IEntity): void {
    this.entities.set(entity.id, entity)
  }
  public removeEntity(id: string): void {
    this.entities.delete(id)
  }
  public getAllEntities(): readonly IEntity[] {
    return Array.from(this.entities.values())
  }
  public getEntitiesByTeam(team: IEntity['team']): readonly IEntity[] {
    return this.getAllEntities().filter((e) => (e as IEntity).team === team)
  }
  // ===Tick===
  public getCurrentTick(): number {
    return this.currentTick
  }
  public incrementTick(): void {
    this.currentTick++
  }
  public resetTick(): void {
    this.currentTick = 0
  }
  // More global combat info can be added here, like RNG seed, combat settings, etc.
}
