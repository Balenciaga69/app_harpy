import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/game-play/run/interfaces/run-context'
import { RunState } from '@/game-play/run/interfaces/run-state'
/**
 * ?��?結�??�?��??�器
 */
export class PostCombatState implements IRunStateHandler {
  async enter(_context: RunContext): Promise<void> {
    // ?�入?��?結�?
    // 1. 結�?下注?�勵
    // 2. 顯示?�鬥結�?
    // 3. ?�進進度
  }
  exit(_context: RunContext): void {
    // ?��??��?結�?
  }
  getAllowedTransitions(): string[] {
    return [RunState.MAP_VIEW, RunState.SHOP, RunState.VICTORY]
  }
}
