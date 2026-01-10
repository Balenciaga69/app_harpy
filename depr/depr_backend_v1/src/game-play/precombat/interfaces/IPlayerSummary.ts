/**
 * 玩家摘要資訊
 *
 * 用於 PreCombat 決策的玩家資料摘要
 */
export interface IPlayerSummary {
  /** 玩家 ID */
  playerId: string
  /** 總資產（金幣） */
  totalAssets: number
  /** 當前可用金幣 */
  availableGold: number
  /** 角色 ID */
  characterId: string
  /** 已使用的 reroll 次數 */
  rerollsUsed: number
  /** 最大可用 reroll 次數（-1 表示無限制） */
  maxRerolls: number
}
