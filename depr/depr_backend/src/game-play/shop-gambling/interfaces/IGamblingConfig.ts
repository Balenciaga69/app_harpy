/**
 * 遊戲模式
 */
export const GameMode = {
  /** 拉霸機 */
  SLOT: 'slot',
  /** 固定賠率 */
  FIXED_ODDS: 'fixedOdds',
  /** 自定義 */
  CUSTOM: 'custom',
} as const

export type GameMode = (typeof GameMode)[keyof typeof GameMode]

/**
 * 賠付條目
 */
export interface IPayoutEntry {
  /** 條件描述（如 'three_7s'、'any_bar' 等） */
  condition: string
  /** 賠率倍數 */
  multiplier: number
  /** 出現機率（選用，用於計算 EV） */
  probability?: number
}

/**
 * 賭博配置
 */
export interface IGamblingConfig {
  /** 遊戲模式 */
  gameMode: GameMode
  /** 最小下注百分比（相對玩家總資產） */
  minBetPercent: number
  /** 最大下注百分比（相對玩家總資產） */
  maxBetPercent: number
  /** 賠付表 */
  payoutTable: IPayoutEntry[]
  /** House Edge 目標（0.05 = 5%） */
  houseEdgeTarget?: number
  /** 單注上限（絕對金額） */
  maxBetAmount?: number
}
