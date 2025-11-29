import { EventBus } from '../event'
import { CombatRandomGenerator, type IEntity } from '../shared'

/**
 * 戰鬥上下文
 * 持有 Ticker、EventBus、RNG 的引用
 * 提供戰鬥 ID、種子等基礎配置
 * 是貧血模型。只包含數據和存取數據的簡單方法，不包含戰鬥邏輯。
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
  public getEntitiesByTeam(team: IEntity['team']): IEntity[] {
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
  // 這裡可以加入更多戰鬥全域資訊，如 RNG 種子、戰鬥設定等
}
