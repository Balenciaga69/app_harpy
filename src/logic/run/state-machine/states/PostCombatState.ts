import type { IRunStateHandler } from '../IRunStateHandler'
import type { RunContext } from '../../models/run-context'
import { RunState } from '../../models/run-state'
/**
 * 戰後結算狀態處理器
 */
export class PostCombatState implements IRunStateHandler {
  async enter(_context: RunContext): Promise<void> {
    // 進入戰後結算
    // 1. 結算下注獎勵
    // 2. 顯示戰鬥結果
    // 3. 推進進度
  }
  exit(_context: RunContext): void {
    // 離開戰後結算
  }
  getAllowedTransitions(): string[] {
    return [RunState.MAP_VIEW, RunState.SHOP, RunState.VICTORY]
  }
}
