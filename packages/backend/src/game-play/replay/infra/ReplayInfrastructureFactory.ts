import type { IReplayEventBus } from '../interfaces/IReplayEventBus'
import type { ITickScheduler } from '../interfaces/tick-scheduler'
import type { IReplayInfrastructureFactory } from '../interfaces/factories/IReplayInfrastructureFactory'
import { BrowserTickScheduler } from './BrowserTickScheduler'
import { ReplayEventBus } from './ReplayEventBus'
/**
 * ReplayInfrastructureFactory
 *
 * 重播基礎設施工廠實作
 * 負責創建重播系統所需的基礎設施組件
 */
export class ReplayInfrastructureFactory implements IReplayInfrastructureFactory {
  /** 單例實例 */
  private static instance: ReplayInfrastructureFactory | null = null
  /** 獲取單例實例 */
  static getInstance(): IReplayInfrastructureFactory {
    if (!this.instance) {
      this.instance = new ReplayInfrastructureFactory()
    }
    return this.instance
  }
  /** 創建事件總線 */
  createEventBus(): IReplayEventBus {
    return new ReplayEventBus()
  }
  /** 創建 Tick 排程器 */
  createTickScheduler(): ITickScheduler {
    return new BrowserTickScheduler()
  }
}
