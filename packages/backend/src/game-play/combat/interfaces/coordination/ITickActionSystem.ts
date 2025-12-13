/**
 * ITickActionSystem
 *
 * Tick 動作系統介面
 * 協調每個 tick 內的所有處理階段
 */
export interface ITickActionSystem {
  /** 執行一個 tick 的所有階段 */
  processTick(): void
  /** 清理資源，解除事件監聽 */
  dispose(): void
}
