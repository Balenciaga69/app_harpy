import { CombatContext } from '../context'
/**
 * TickerDriver：戰鬥時間循環的驅動引擎。
 *
 * 設計理念：
 * - 作為戰鬥的心跳系統，驅動整個戰鬥的時間進程。
 * - 通過事件驅動模式，發射 Tick 相關事件，讓其他系統響應時間流逝。
 * - 支援可配置的結束條件，實現靈活的戰鬥終止邏輯。
 * - 提供快照機制，定期記錄戰鬥狀態，支援回放與分析。
 * - 設置最大 Tick 限制，防止無限循環導致的程式卡死。
 *
 * 主要職責：
 * - 執行單次 Tick，發射 tick:start 與 tick:end 事件。
 * - 管理戰鬥循環，持續執行 Tick 直到達成結束條件。
 * - 定期觸發快照事件，記錄戰鬥狀態供後續分析。
 * - 檢查戰鬥結束條件，適時停止戰鬥循環。
 */
const MAX_TICKS = 100000
export class TickerDriver {
  private context: CombatContext
  private readonly snapshotInterval: number
  private isRunning: boolean = false
  private maxTicks: number = MAX_TICKS // 防止無限循環
  private stopCondition: () => boolean = () => false // 用於判斷戰鬥結束的條件
  constructor(context: CombatContext, maxTicks: number = MAX_TICKS, snapshotInterval: number = 100) {
    this.context = context
    this.maxTicks = maxTicks
    this.snapshotInterval = snapshotInterval
  }
  /** 設置戰鬥結束條件 */
  public setStopCondition(condition: () => boolean): void {
    this.stopCondition = condition // 可能是因為 一方全滅 或 達成特定目標
  }
  /** 執行單次 Tick */
  public tick(): void {
    this.context.eventBus.emit('tick:start', { tick: this.context.getCurrentTick() })
    if (this.shouldTakeSnapshot()) {
      this.takeSnapshot()
    }
    // 這裡未來會呼叫 System 來處理效果、DoT 等邏輯
    this.context.incrementTick()
    this.context.eventBus.emit('tick:end', { tick: this.context.getCurrentTick() })
  }
  /** 啟動戰鬥循環 (預計算模式) */
  public start(): void {
    this.isRunning = true
    this.context.resetTick()
    this.context.eventBus.emit('combat:start', undefined)
    while (this.isRunning && this.context.getCurrentTick() < this.maxTicks) {
      this.tick()
      if (this.checkCombatEnd()) {
        this.stop()
      }
    }
  }
  /** 停止戰鬥 */
  public stop(): void {
    if (!this.isRunning) return // 防止重複停止
    this.isRunning = false
    // 發出停止事件,讓訂閱者有機會清理資源
    this.context.eventBus.emit('ticker:stopped', { tick: this.context.getCurrentTick() })
  }
  /** 檢查戰鬥是否結束 (由 CombatEngine 注入判斷邏輯) */
  private checkCombatEnd(): boolean {
    return this.stopCondition()
  }
  /** 判斷當前 tick 是否需要快照 */
  private shouldTakeSnapshot(): boolean {
    return this.context.getCurrentTick() % this.snapshotInterval === 0
  }
  /** 記錄完整快照 */
  private takeSnapshot(): void {
    // TODO: 取得所有 Entity 的狀態快照
    this.context.eventBus.emit('tick:snapshot', {
      tick: this.context.getCurrentTick(),
      entities: [], // TODO: 取得所有 Entity 的狀態快照
    })
  }
}
