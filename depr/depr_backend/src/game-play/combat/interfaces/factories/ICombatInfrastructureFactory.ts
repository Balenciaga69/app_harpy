import type { ICombatEventBus } from '../event-bus/ICombatEventBus'
import type { IResourceRegistry } from '../resource-registry/IResourceRegistry'
import type { IEventLogger } from '../logger/IEventLogger'
/**
 * ICombatInfrastructureFactory
 *
 * 戰鬥基礎設施工廠介面
 * 負責創建戰鬥系統所需的基礎設施組件
 */
export interface ICombatInfrastructureFactory {
  /** 創建事件總線 */
  createEventBus(): ICombatEventBus
  /** 創建資源註冊表 */
  createResourceRegistry(): IResourceRegistry
  /** 創建事件日誌記錄器 */
  createEventLogger(eventBus: ICombatEventBus): IEventLogger
}
