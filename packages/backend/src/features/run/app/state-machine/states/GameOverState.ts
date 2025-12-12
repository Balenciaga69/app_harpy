import type { IRunStateHandler } from '../IRunStateHandler'
import { RunContext } from '@/features/run/interfaces/models/run-context'
import { RunState } from '@/features/run/interfaces/models/run-state'
/**
 * 遊戲結束狀態處理器
 */
export class GameOverState implements IRunStateHandler {
  enter(_context: RunContext): void {
    // 進入遊戲結束
    // 檢查是否有續命道具
    // 顯示結束畫面
  }
  exit(_context: RunContext): void {
    // 離開遊戲結束
  }
  getAllowedTransitions(): string[] {
    return [RunState.SHOP, RunState.UNINITIALIZED] // 續命回商店，或重新開始
  }
}
