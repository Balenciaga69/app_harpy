import type { CombatContext } from '../../context'
import { isCharacter } from '../../infra/shared'
/**
 * TickerProcessor：Tick 事件的具體處理器。
 *
 * 設計理念：
 * - 作為觀察者模式的實現，監聽 tick:start 事件並執行對應邏輯。
 * - 遵循單一職責原則，專注於觸發角色效果的 Tick 更新。
 * - 通過事件驅動實現鬆耦合，與 TickerDriver 解耦。
 * - 提供 dispose 方法，支援系統的優雅清理與資源釋放。
 *
 * 主要職責：
 * - 監聽每個 Tick 開始事件，自動觸發處理邏輯。
 * - 遍歷所有角色實體，調用其效果的 onTick 方法。
 * - 處理持續性效果的更新（如持續傷害、定期治療、Buff 衰減）。
 * - 提供系統清理方法，移除事件監聽避免記憶體洩漏。
 */
export class TickerProcessor {
  private context: CombatContext
  private tickHandler: () => void
  constructor(context: CombatContext) {
    this.context = context
    this.tickHandler = () => this.processTick()
    this.registerEventListeners()
  }
  /** 註冊事件監聽 */
  private registerEventListeners(): void {
    // 監聽每個 Tick 開始事件
    this.context.eventBus.on('tick:start', this.tickHandler)
  }
  /** 處理 Tick */
  private processTick(): void {
    this.context.getAllEntities().forEach((entity) => {
      if (!isCharacter(entity)) return
      entity.getAllEffects().forEach((effect) => effect.onTick?.(entity, this.context))
    })
  }
  /** 清理系統（移除事件監聽） */
  public dispose(): void {
    this.context.eventBus.off('tick:start', this.tickHandler)
  }
}
