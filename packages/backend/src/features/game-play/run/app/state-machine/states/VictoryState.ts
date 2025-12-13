import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/features/game-play/run/interfaces/run-context'
import { RunState } from '@/features/game-play/run/interfaces/run-state'
/**
 * ?�利?�?��??�器
 */
export class VictoryState implements IRunStateHandler {
  enter(_context: RunContext): void {
    // ?�入?�利?�??
    // 顯示?�利?�面（�??��??��??��??��??��?條件�?
  }
  exit(_context: RunContext): void {
    // ?��??�利?�??
  }
  getAllowedTransitions(): string[] {
    return [RunState.UNINITIALIZED] // ?�到主選??
  }
}
