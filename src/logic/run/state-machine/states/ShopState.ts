import type { IRunStateHandler } from '../IRunStateHandler'
import type { RunContext } from '../../models/run-context'
import { RunState } from '../../models/run-state'
/**
 * 商店狀態處理器
 */
export class ShopState implements IRunStateHandler {
  enter(_context: RunContext): void {
    // 進入商店
    // 刷新商品列表
  }
  exit(_context: RunContext): void {
    // 離開商店
  }
  getAllowedTransitions(): string[] {
    return [RunState.MAP_VIEW, RunState.PRE_COMBAT]
  }
}
