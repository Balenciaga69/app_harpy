import type { IEntity } from '../shared/models/entity.model'
import { EventBus } from './EventBus'
/**
 * 戰鬥上下文
 * 持有 Ticker、EventBus、EventLogger 的引用
 * 提供戰鬥 ID、種子等基礎配置
 * 不應該包含角色數據或戰鬥邏輯
 */
export class CombatContext {
  public readonly eventBus: EventBus
  public currentTick: number = 0
  // 使用 Map 儲存戰鬥單位，解耦具體的 Store 實作
  private entities: Map<string, IEntity> = new Map()
  constructor() {
    this.eventBus = new EventBus()
  }
  public getEntity(id: string): IEntity | undefined {
    return this.entities.get(id)
  }
  public addEntity(entity: IEntity): void {
    this.entities.set(entity.id, entity)
  }
  // 這裡可以加入更多戰鬥全域資訊，如 RNG 種子、戰鬥設定等
}
