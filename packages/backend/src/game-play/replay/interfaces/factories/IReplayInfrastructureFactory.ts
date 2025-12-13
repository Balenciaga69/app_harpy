import type { IReplayEventBus } from '../IReplayEventBus'
import type { ITickScheduler } from '../tick-scheduler'
/**
 * IReplayInfrastructureFactory
 *
 * 重播基礎設施工廠介面
 * 負責創建重播系統所需的基礎設施組件
 */
export interface IReplayInfrastructureFactory {
  /** 創建事件總線 */
  createEventBus(): IReplayEventBus
  /** 創建 Tick 排程器 */
  createTickScheduler(): ITickScheduler
}
