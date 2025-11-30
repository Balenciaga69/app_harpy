import type { CombatContext } from '../core/CombatContext'
export class TickerSystem {
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
      if (!this.context.isCharacter(entity)) return
      entity.getAllEffects().forEach((effect) => effect.onTick?.(entity, this.context))
    })
  }
  /** 清理系統（移除事件監聽） */
  public dispose(): void {
    this.context.eventBus.off('tick:start', this.tickHandler)
  }
}
