import type { IRunStateHandler } from '../IRunStateHandler'
import type { RunContext } from '../../models/run-context'
import { RunState } from '../../models/run-state'
/**
 * 事件觸發狀態處理器
 */
export class EventState implements IRunStateHandler {
  async enter(_context: RunContext): Promise<void> {
    // 進入事件
    // 觸發隨機事件
  }
  exit(_context: RunContext): void {
    // 離開事件
  }
  getAllowedTransitions(): string[] {
    return [RunState.MAP_VIEW, RunState.SHOP]
  }
}
