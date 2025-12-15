import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/game-play/run/interfaces/run-context'
import { RunState } from '@/game-play/run/interfaces/run-state'
/**
 * ?�戲結�??�?��??�器
 */
export class GameOverState implements IRunStateHandler {
  enter(_context: RunContext): void {
    // ?�入?�戲結�?
    // 檢查?�否?��??��???
    // 顯示結�??�面
  }
  exit(_context: RunContext): void {
    // ?��??�戲結�?
  }
  getAllowedTransitions(): string[] {
    return [RunState.SHOP, RunState.UNINITIALIZED] // 續命?��?店�??��??��?�?
  }
}
