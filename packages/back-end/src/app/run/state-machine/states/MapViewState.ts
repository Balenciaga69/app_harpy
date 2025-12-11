import type { IRunStateHandler } from '../IRunStateHandler'
import type { RunContext } from '../../models/run-context'
import { RunState } from '../../models/run-state'
/**
 * 地圖瀏覽狀態處理器
 */
export class MapViewState implements IRunStateHandler {
  enter(_context: RunContext): void {
    // 進入地圖瀏覽
    // 顯示當前章節的 10 個節點
  }
  exit(_context: RunContext): void {
    // 離開地圖
  }
  getAllowedTransitions(): string[] {
    return [RunState.PRE_COMBAT, RunState.SHOP, RunState.EVENT, RunState.GAME_OVER]
  }
}
