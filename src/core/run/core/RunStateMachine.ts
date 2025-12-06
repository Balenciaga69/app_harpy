import type { SceneState } from '../models'
import { SCENE_TRANSITIONS } from './scene-transition'
/**
 * 執行流程狀態機
 *
 * 管理執行（run）中的場景狀態轉換。
 * 驗證轉換並提供當前狀態資訊。
 */
export class RunStateMachine {
  // TODO: 如果商店/投注 UI 成為執行流程的一部分，考慮新增場景狀態，例如 'shop' 或 'betting'
  private currentState: SceneState = 'idle'
  /** 取得當前場景狀態 */
  getState(): SceneState {
    return this.currentState
  }
  /** 檢查從當前狀態是否能夠進行指定觸發器的轉換 */
  canTransition(trigger: string): boolean {
    return SCENE_TRANSITIONS.some((t) => t.from === this.currentState && t.trigger === trigger)
  }
  /** 嘗試轉換到新狀態 */
  transition(trigger: string): boolean {
    const transition = SCENE_TRANSITIONS.find((t) => t.from === this.currentState && t.trigger === trigger)
    if (!transition) {
      return false
    }
    this.currentState = transition.to
    return true
  }
  /** 強制設定狀態（用於載入存檔） */
  setState(state: SceneState): void {
    this.currentState = state
  }
  /** 重置為空閒狀態 */
  reset(): void {
    this.currentState = 'idle'
  }
  /** 檢查執行是否處於終止狀態 */
  isTerminal(): boolean {
    return this.currentState === 'game_over' || this.currentState === 'idle'
  }
}
