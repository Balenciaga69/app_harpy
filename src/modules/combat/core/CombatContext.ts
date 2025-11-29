import type { IEntity } from '../shared/models/entity.model'
import { EventBus } from '../event/EventBus'
/**
 * 戰鬥上下文
 * 持有 Ticker、EventBus、EventLogger 的引用
 * 提供戰鬥 ID、種子等基礎配置
 * 不應該包含角色數據或戰鬥邏輯
 * 應該是一個 貧血模型。它只應該包含數據和存取數據的簡單方法，絕對不包含戰鬥邏輯。
 */
export class CombatContext {
  public readonly eventBus: EventBus
  private currentTick: number = 0
  private entities: Map<string, IEntity> = new Map() // 使用 Map 儲存戰鬥單位，解耦具體的 Store 實作
  constructor() {
    this.eventBus = new EventBus()
  }
  // Entity
  public getEntity(id: string): IEntity | undefined {
    return this.entities.get(id)
  }
  public addEntity(entity: IEntity): void {
    this.entities.set(entity.id, entity)
  }
  // Tick
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
