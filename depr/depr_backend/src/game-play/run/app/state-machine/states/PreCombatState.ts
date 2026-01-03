import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/game-play/run/interfaces/run-context'
import { RunState } from '@/game-play/run/interfaces/run-state'
/**
 * ?��?準�??�?��??�器
 */
export class PreCombatState implements IRunStateHandler {
  async enter(_context: RunContext): Promise<void> {
    // ?�入?��?準�?
    // 1. ?��?賽�?變數
    // 2. 顯示下注介面
    // 3. 等�??�家準�?完�?
  }
  exit(_context: RunContext): void {
    // ?��??��?準�?
  }
  getAllowedTransitions(): string[] {
    return [RunState.COMBAT, RunState.MAP_VIEW]
  }
}
