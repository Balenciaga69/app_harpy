import type { IRunStateHandler } from '../IRunStateHandler'
import type { RunContext } from '../../models/run-context'
import { RunState } from '../../models/run-state'
/**
 * 勝利狀態處理器
 */
export class VictoryState implements IRunStateHandler {
  enter(_context: RunContext): void {
    // 進入勝利狀態
    // 顯示勝利畫面（完成所有關卡或達成特殊條件）
  }
  exit(_context: RunContext): void {
    // 離開勝利狀態
  }
  getAllowedTransitions(): string[] {
    return [RunState.UNINITIALIZED] // 回到主選單
  }
}
