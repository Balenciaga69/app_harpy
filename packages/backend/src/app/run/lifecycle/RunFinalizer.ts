import type { RunContext } from '../models/run-context'
/**
 * Run 結束處理器
 * 負責處理 Run 結束時的清理與結算
 */
export class RunFinalizer {
  /**
   * 處理遊戲結束
   */
  finalize(_context: RunContext, _isVictory: boolean): void {
    // TODO: 記錄統計資料
    // TODO: 更新永久進度（如商店通膨）
    // TODO: 清理暫存資料
  }
  /**
   * 處理續命復活
   */
  handleRevive(context: RunContext): void {
    // 消耗續命道具
    context.hasReviveItem = false
    // 保留裝備與金幣
    // 回到商店狀態
  }
}
