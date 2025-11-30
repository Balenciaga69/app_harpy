import { CombatContext } from '../core/CombatContext'
export class Ticker {
  private context: CombatContext
  private readonly snapshotInterval: number
  private isRunning: boolean = false
  private maxTicks: number = 10000 // 防止無限循環
  private stopCondition: () => boolean = () => false // 用於判斷戰鬥結束的條件
  constructor(context: CombatContext, maxTicks: number = 10000, snapshotInterval: number = 100) {
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
    this.isRunning = false
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
