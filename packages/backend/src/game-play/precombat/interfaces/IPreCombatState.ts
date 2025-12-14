import type { IPreCombatVariable } from './IPreCombatVariable'
import type { ICombatBettingResult } from './ICombatBettingResult'

/**
 * 賽前準備狀態
 *
 * 包含所有賽前變數、下注資訊與確認狀態
 */
export interface IPreCombatState {
  /** 最終確認注入的變數清單 */
  variables: IPreCombatVariable[]
  /** 玩家下注結果（若無下注則為 null） */
  betting: ICombatBettingResult | null
  /** 是否已確認進入戰鬥 */
  confirmed: boolean
  /** 使用的隨機種子（用於可重現性） */
  seed: string | number
  /** 建立時間戳記 */
  createdAt: number
}
