import type { IRunStateHandler } from '../IRunStateHandler'
import type { RunContext } from '../../models/run-context'
import { RunState } from '../../models/run-state'
/**
 * 戰前準備狀態處理器
 */
export class PreCombatState implements IRunStateHandler {
  async enter(_context: RunContext): Promise<void> {
    // 進入戰前準備
    // 1. 生成賽前變數
    // 2. 顯示下注介面
    // 3. 等待玩家準備完成
  }
  exit(_context: RunContext): void {
    // 離開戰前準備
  }
  getAllowedTransitions(): string[] {
    return [RunState.COMBAT, RunState.MAP_VIEW]
  }
}
