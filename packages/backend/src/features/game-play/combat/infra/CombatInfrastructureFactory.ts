import type { ICombatEventBus } from '../interfaces/event-bus/ICombatEventBus'
import type { IResourceRegistry } from '../interfaces/resource-registry/IResourceRegistry'
import type { IEventLogger } from '../interfaces/logger/IEventLogger'
import { EventBus } from './event-bus/EventBus'
import { InMemoryResourceRegistry } from './resource-registry/InMemoryResourceRegistry'
import { EventLogger } from './logger/EventLogger'
/**
 * CombatInfrastructureFactory
 *
 * 負責創建戰鬥系統所需的基礎設施組件
 * 這個工廠讓 app 層可以透過 infra 層創建組件，而不直接依賴實作類別
 */
export class CombatInfrastructureFactory {
  /**
   * 創建事件總線
   */
  static createEventBus(): ICombatEventBus {
    return new EventBus()
  }
  /**
   * 創建資源註冊表
   */
  static createResourceRegistry(): IResourceRegistry {
    return new InMemoryResourceRegistry()
  }
  /**
   * 創建事件日誌記錄器
   */
  static createEventLogger(eventBus: ICombatEventBus): IEventLogger {
    return new EventLogger(eventBus)
  }
}
