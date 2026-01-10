import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/game-play/run/interfaces/run-context'
import { RunState } from '@/game-play/run/interfaces/run-state'
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
