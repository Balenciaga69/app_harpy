import type { CombatContext } from '../../context'
import type { CombatStartPayload } from '../../infra/event-bus'
/**
 * TickerDriver：戰鬥時間循環的驅動引擎
 *
 * 設計理念：
 * - 作為戰鬥的心跳系統，驅動整個戰鬥的時間進程
 * - 通過事件驅動模式，發射 Tick 相關事件，讓其他系統響應時間流逝
 * - 支援可配置的結束條件，實現靈活的戰鬥終止邏輯
 * - 設置最大 Tick 限制，防止無限循環導致的程式卡死
 * - 職責專一：只負責驅動時間流逝，不負責狀態快照
 *
 * 主要職責：
 * - 執行單次 Tick，發射 tick:start 與 tick:end 事件
 * - 管理戰鬥循環，持續執行 Tick 直到達成結束條件
 * - 檢查戰鬥結束條件，適時停止戰鬥循環
 */
const MAX_TICKS = 100000
export class TickerDriver {
  private context: CombatContext
  private readonly maxTicks: number
  private isRunning: boolean = false
  private stopCondition: () => boolean = () => false
  constructor(context: CombatContext, maxTicks: number = MAX_TICKS) {
    this.context = context
    this.maxTicks = maxTicks
  }
  /** 設置戰鬥結束條件 */
  public setStopCondition(condition: () => boolean): void {
    this.stopCondition = condition
  }
  /** 執行單次 Tick */
  public tick(): void {
    this.context.eventBus.emit('tick:start', { tick: this.context.getCurrentTick() })
    this.context.incrementTick()
    this.context.eventBus.emit('tick:end', { tick: this.context.getCurrentTick() })
  }
  /** 啟動戰鬥循環 (預計算模式) */
  public start(): void {
    this.isRunning = true
    this.context.resetTick()
    this.context.eventBus.emit('combat:start', {} as CombatStartPayload)
    while (this.isRunning && this.context.getCurrentTick() < this.maxTicks) {
      this.tick()
      if (this.checkCombatEnd()) {
        this.stop()
      }
    }
  }
  /** 停止戰鬥 */
  public stop(): void {
    if (!this.isRunning) return
    this.isRunning = false
    this.context.eventBus.emit('ticker:stopped', { tick: this.context.getCurrentTick() })
  }
  /** 檢查戰鬥是否結束 */
  private checkCombatEnd(): boolean {
    return this.stopCondition()
  }
}
