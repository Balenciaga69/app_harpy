import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/game-play/run/interfaces/run-context'
import { RunState } from '@/game-play/run/interfaces/run-state'
/**
 * ?��??�覽?�?��??�器
 */
export class MapViewState implements IRunStateHandler {
  enter(_context: RunContext): void {
    // ?�入?��??�覽
    // 顯示?��?章�???10 ?��?�?
  }
  exit(_context: RunContext): void {
    // ?��??��?
  }
  getAllowedTransitions(): string[] {
    return [RunState.PRE_COMBAT, RunState.SHOP, RunState.EVENT, RunState.GAME_OVER]
  }
}
