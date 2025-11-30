import type { ICharacter } from '../../character/interfaces/character.interface'
/**
 * 戰鬥配置
 * 定義一場戰鬥的初始參數
 */
export interface CombatConfig {
  /** 隨機數種子 (用於可重現的戰鬥) */
  seed?: string | number
  /** 玩家隊伍 */
  playerTeam: ICharacter[]
  /** 敵人隊伍 */
  enemyTeam: ICharacter[]
  /** 最大 Tick 數 (防止無限循環) */
  maxTicks?: number
  /** 快照間隔 (每 N 個 Tick 記錄一次快照) */
  snapshotInterval?: number
  /** 是否啟用日誌記錄 */
  enableLogging?: boolean
}
