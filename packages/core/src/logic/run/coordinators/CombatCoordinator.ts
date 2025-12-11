import type { RunContext } from '../models/run-context'
/**
 * 戰鬥協調器
 * 封裝與 CombatEngine 的互動邏輯
 */
export class CombatCoordinator {
  /**
   * 執行戰鬥
   */
  async executeCombat(_context: RunContext): Promise<unknown> {
    // TODO: 調用 CombatEngine.execute()
    // 1. 準備玩家實體
    // 2. 生成敵人
    // 3. 執行戰鬥
    // 4. 返回戰鬥結果
    return null // placeholder
  }
  /**
   * 取得戰鬥結果
   */
  getCombatResult(): unknown {
    // TODO: 返回最近一次戰鬥結果
    return null // placeholder
  }
}
