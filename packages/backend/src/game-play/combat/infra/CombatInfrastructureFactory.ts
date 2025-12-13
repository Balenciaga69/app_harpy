import type { ICombatEventBus } from '../interfaces/event-bus/ICombatEventBus'
import type { IResourceRegistry } from '../interfaces/resource-registry/IResourceRegistry'
import type { IEventLogger } from '../interfaces/logger/IEventLogger'
import type { ICombatInfrastructureFactory } from '../interfaces/factories/ICombatInfrastructureFactory'
import { EventBus } from './event-bus/EventBus'
import { InMemoryResourceRegistry } from './resource-registry/InMemoryResourceRegistry'
import { EventLogger } from './logger/EventLogger'

/**
 * CombatInfrastructureFactory
 *
 * 負責創建戰鬥系統所需的基礎設施組件
 * 實作 ICombatInfrastructureFactory 介面
 */
export class CombatInfrastructureFactory implements ICombatInfrastructureFactory {
  /** 單例實例 */
  private static instance: CombatInfrastructureFactory | null = null

  /** 獲取單例實例 */
  static getInstance(): ICombatInfrastructureFactory {
    if (!this.instance) {
      this.instance = new CombatInfrastructureFactory()
    }
    return this.instance
  }

  /** 創建事件總線 */
  createEventBus(): ICombatEventBus {
    return new EventBus()
  }

  /** 創建資源註冊表 */
  createResourceRegistry(): IResourceRegistry {
    return new InMemoryResourceRegistry()
  }

  /** 創建事件日誌記錄器 */
  createEventLogger(eventBus: ICombatEventBus): IEventLogger {
    return new EventLogger(eventBus)
  }

  /** @deprecated 請使用 getInstance() */
  static createEventBus(): ICombatEventBus {
    return CombatInfrastructureFactory.getInstance().createEventBus()
  }

  /** @deprecated 請使用 getInstance() */
  static createResourceRegistry(): IResourceRegistry {
    return CombatInfrastructureFactory.getInstance().createResourceRegistry()
  }

  /** @deprecated 請使用 getInstance() */
  static createEventLogger(eventBus: ICombatEventBus): IEventLogger {
    return CombatInfrastructureFactory.getInstance().createEventLogger(eventBus)
  }
}
