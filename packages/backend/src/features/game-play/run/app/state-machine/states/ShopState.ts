import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/features/game-play/run/interfaces/run-context'
import { RunState } from '@/features/game-play/run/interfaces/run-state'
/**
 * ?��??�?��??�器
 */
export class ShopState implements IRunStateHandler {
  enter(_context: RunContext): void {
    // ?�入?��?
    // ?�新?��??�表
  }
  exit(_context: RunContext): void {
    // ?��??��?
  }
  getAllowedTransitions(): string[] {
    return [RunState.MAP_VIEW, RunState.PRE_COMBAT]
  }
}
