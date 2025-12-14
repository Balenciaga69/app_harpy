/**
 * 血量區間定義
 */
export const HealthBracket = {
  /** 1-10% 剩餘血量 */
  CRITICAL: 'CRITICAL',
  /** 11-30% 剩餘血量 */
  LOW: 'LOW',
  /** 31-60% 剩餘血量 */
  MEDIUM: 'MEDIUM',
  /** 61-100% 剩餘血量 */
  HIGH: 'HIGH',
} as const

export type HealthBracket = (typeof HealthBracket)[keyof typeof HealthBracket]

/**
 * 戰鬥下注結果
 */
export interface ICombatBettingResult {
  /** 下注的血量區間 */
  bracket: HealthBracket
  /** 下注金額 */
  betAmount: number
  /** 賠率倍數 */
  multiplier: number
  /** 潛在獲利（betAmount * multiplier） */
  potentialPayout: number
  /** 下注時間戳記 */
  placedAt: number
}
