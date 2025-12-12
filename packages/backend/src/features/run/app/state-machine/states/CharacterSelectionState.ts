import type { IRunStateHandler } from '../IRunStateHandler'
import { RunContext } from '@/features/run/interfaces/models/run-context'
import { RunState } from '@/features/run/interfaces/models/run-state'
/**
 * 角色選擇狀態處理器
 */
export class CharacterSelectionState implements IRunStateHandler {
  enter(_context: RunContext): void {
    // 進入角色選擇畫面
    // UI 層會監聽狀態變化並顯示角色選擇介面
  }
  exit(_context: RunContext): void {
    // 離開角色選擇
    // 確保已選擇角色
  }
  getAllowedTransitions(): string[] {
    return [RunState.MAP_VIEW, RunState.UNINITIALIZED]
  }
}
