/**
 * 下注元資料（slot 模式）
 */
export interface ISlotBetMeta {
  /** 下注線數 */
  lines?: number
  /** 每線注數 */
  betPerLine?: number
}

/**
 * 下注元資料（固定賠率模式）
 */
export interface IFixedOddsBetMeta {
  /** 選擇的選項 ID */
  optionId: string
  /** 其他參數 */
  params?: Record<string, unknown>
}

/**
 * 下注請求
 */
export interface IBetRequest {
  /** 玩家 ID */
  playerId: string
  /** 下注金額 */
  betAmount: number
  /** 下注元資料（依遊戲模式不同） */
  betMeta?: ISlotBetMeta | IFixedOddsBetMeta | Record<string, unknown>
  /** 隨機種子（選用） */
  seed?: string | number
}
