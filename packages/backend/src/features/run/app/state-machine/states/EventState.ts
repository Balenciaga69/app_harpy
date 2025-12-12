import { RunState } from '@/features/run/interfaces/models/run-state'
import type { IRunStateHandler } from '../IRunStateHandler'
import { RunContext } from '@/features/run/interfaces/models/run-context'
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
