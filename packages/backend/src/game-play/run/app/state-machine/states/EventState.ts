import { RunState } from '@/game-play/run/interfaces/run-state'
import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/game-play/run/interfaces/run-context'
/**
 * 事件觸發?�?��??�器
 */
export class EventState implements IRunStateHandler {
  async enter(_context: RunContext): Promise<void> {
    // ?�入事件
    // 觸發?��?事件
  }
  exit(_context: RunContext): void {
    // ?��?事件
  }
  getAllowedTransitions(): string[] {
    return [RunState.MAP_VIEW, RunState.SHOP]
  }
}
