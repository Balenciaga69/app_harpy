/**
 * Slot 結果
 */
export interface ISlotOutcome {
  /** 每條 reel 的符號結果 */
  reelSymbols: string[][]
  /** 贏線資訊 */
  winLines: Array<{
    lineId: number
    symbols: string[]
    multiplier: number
  }>
  /** 總倍數 */
  totalMultiplier: number
}

/**
 * 固定賠率結果
 */
export interface IFixedOddsOutcome {
  /** 選擇的選項 ID */
  optionId: string
  /** 是否獲勝 */
  isWin: boolean
  /** 倍數 */
  multiplier: number
  /** 結果描述 */
  description?: string
}

/**
 * 交易結果
 */
export interface ITransactionResult {
  /** 是否成功 */
  success: boolean
  /** 交易 ID */
  transactionId: string
  /** 變動前餘額 */
  balanceBefore: number
  /** 變動後餘額 */
  balanceAfter: number
  /** 錯誤訊息（若失敗） */
  error?: string
}

/**
 * 賭博結果
 */
export interface IGamblingResult {
  /** 結果 outcome（依模式不同） */
  outcome: ISlotOutcome | IFixedOddsOutcome | Record<string, unknown>
  /** 賠付金額 */
  payoutAmount: number
  /** 淨收益（payout - betAmount） */
  netProfit: number
  /** 交易結果 */
  transaction: ITransactionResult
  /** 使用的種子 */
  seed: string | number
  /** 時間戳記 */
  timestamp: number
}
