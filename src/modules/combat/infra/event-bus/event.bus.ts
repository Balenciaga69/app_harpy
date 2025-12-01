/* eslint-disable @typescript-eslint/no-explicit-any */
import mitt from 'mitt'
import type { CombatEventMap } from './combat.event.map.model'
/**
 * EventBus：戰鬥系統的事件總線。
 *
 * 設計理念：
 * - 使用輕量級的 mitt 實作，作為事件驅動中樞，提供事件管理 API。
 *
 * 主要職責：
 * - 提供事件訂閱 / 取消訂閱功能。
 * - 提供事件發佈功能，供系統在關鍵節點（如 tick、傷害、死亡）發出通知。
 * - 支援監聽所有事件（onAll），方便日誌或調試系統使用。
 * - 支援清除所有監聽器，在戰鬥結束時釋放資源。
 */
export class EventBus {
  // mitt 實例，用於事件管理
  private emitter = mitt<CombatEventMap>()
  /**訂閱事件 */
  public on<K extends keyof CombatEventMap>(event: K, handler: (payload: CombatEventMap[K]) => void): void {
    this.emitter.on(event, handler)
  }
  /** 取消訂閱 */
  public off<K extends keyof CombatEventMap>(event: K, handler: (payload: CombatEventMap[K]) => void): void {
    this.emitter.off(event, handler)
  }
  /** 發布事件 */
  public emit<K extends keyof CombatEventMap>(event: K, payload: CombatEventMap[K]): void {
    this.emitter.emit(event, payload)
  }
  /** 監聽所有事件 (用於 Logger 或 Debug) */
  public onAll(handler: (type: keyof CombatEventMap, payload: any) => void): void {
    this.emitter.on('*', handler as any)
  }
  /** 清除所有監聽器 (用於戰鬥結束後的清理) */
  public clear(): void {
    this.emitter = mitt<CombatEventMap>() // mitt 沒有內建 clear 方法，所以創建新實例來重置
  }
}
