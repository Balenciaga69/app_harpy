/**
 * Run 流程的各個狀態
 */
export const RunState = {
  /** 未初始化 */
  UNINITIALIZED: 'UNINITIALIZED',
  /** 角色選擇 */
  CHARACTER_SELECTION: 'CHARACTER_SELECTION',
  /** 關卡地圖瀏覽 */
  MAP_VIEW: 'MAP_VIEW',
  /** 戰前準備（商店、下注、賽前變數） */
  PRE_COMBAT: 'PRE_COMBAT',
  /** 戰鬥中 */
  COMBAT: 'COMBAT',
  /** 戰後結算 */
  POST_COMBAT: 'POST_COMBAT',
  /** 商店 */
  SHOP: 'SHOP',
  /** 事件觸發 */
  EVENT: 'EVENT',
  /** 本局遊戲結束 */
  GAME_OVER: 'GAME_OVER',
  /** 勝利 */
  VICTORY: 'VICTORY',
} as const
export type RunStateType = (typeof RunState)[keyof typeof RunState]
