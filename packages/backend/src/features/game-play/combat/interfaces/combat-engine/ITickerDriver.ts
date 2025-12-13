/**
 * Ticker 驅動器介面
 *
 * 負責驅動戰鬥的 tick 循環
 */
export interface ITickerDriver {
  /** 設定停止條件 */
  setStopCondition(condition: () => boolean): void

  /** 啟動 ticker */
  start(): void

  /** 停止 ticker */
  stop(): void

  /** 獲取當前 tick */
  getCurrentTick(): number
}
