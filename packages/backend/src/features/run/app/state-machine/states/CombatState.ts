import type { IRunStateHandler } from '../IRunStateHandler'
import { RunContext } from '@/features/run/interfaces/models/run-context'
import { RunState } from '@/features/run/interfaces/models/run-state'
/**
 * 戰鬥中狀態處理器
 */
export class CombatState implements IRunStateHandler {
  async enter(_context: RunContext): Promise<void> {
    // 進入戰鬥
    // 調用 CombatEngine 執行戰鬥
    // 戰鬥在瞬間完成，返回結果
  }
  exit(_context: RunContext): void {
    // 離開戰鬥
  }
  getAllowedTransitions(): string[] {
    return [RunState.POST_COMBAT, RunState.GAME_OVER]
  }
}
