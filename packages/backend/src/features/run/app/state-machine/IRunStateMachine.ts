import { RunContext } from '../../interfaces/models/run-context'
import { RunStateType } from '../../interfaces/models/run-state'
/**
 * Run 狀態機介面
 */
export interface IRunStateMachine {
  /**
   * 轉換到新狀態
   */
  transitionTo(newState: RunStateType, context: RunContext): Promise<void>
  /**
   * 檢查是否可以轉換到指定狀態
   */
  canTransitionTo(from: RunStateType, to: RunStateType): boolean
  /**
   * 取得當前狀態
   */
  getCurrentState(): RunStateType
}
