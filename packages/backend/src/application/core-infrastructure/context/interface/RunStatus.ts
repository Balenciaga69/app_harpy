/**
 * Run 狀態類型
 * 定義 Run 的生命週期階段
 */
export type RunStatus =
  | 'STAGE_SELECTION' // 選擇關卡階段
  | 'PRE_COMBAT' // 戰前準備（可選，例如下注系統）
  | 'IN_COMBAT' // 戰鬥進行中
  | 'POST_COMBAT_PENDING' // 戰鬥結束，等待玩家領取獎勵
  | 'SHOP' // 商店階段
  | 'EVENT' // 事件階段
  | 'RUN_ENDED' // Run 結束（勝利或失敗）
