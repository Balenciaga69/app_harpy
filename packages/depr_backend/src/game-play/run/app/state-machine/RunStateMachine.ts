import { RunState } from '../../interfaces/run-state'
import { RunStateType } from '../../interfaces/run-state'
import { RunContext } from '../../interfaces/run-context'
import type { IRunStateMachine } from '../../interfaces/IRunStateMachine'
import type { IRunStateHandler } from '../../interfaces/IRunStateHandler'
import { InvalidStateTransitionError } from '../../domain/errors/RunError'
/**
 * Run 狀態機實作
 * 使用 State Pattern 管理狀態轉換
 */
export class RunStateMachine implements IRunStateMachine {
  private currentState: RunStateType
  private handlers: Map<RunStateType, IRunStateHandler>
  constructor() {
    this.currentState = RunState.UNINITIALIZED
    this.handlers = new Map()
  }
  /**
   * 註冊狀態處理器
   */
  registerHandler(state: RunStateType, handler: IRunStateHandler): void {
    this.handlers.set(state, handler)
  }
  /**
   * 轉換到新狀態
   */
  async transitionTo(newState: RunStateType, context: RunContext): Promise<void> {
    if (!this.canTransitionTo(this.currentState, newState)) {
      throw new InvalidStateTransitionError(this.currentState, newState)
    }
    const currentHandler = this.handlers.get(this.currentState)
    const newHandler = this.handlers.get(newState)
    // 離開當前狀態
    if (currentHandler) {
      await currentHandler.exit(context)
    }
    // 更新狀態
    this.currentState = newState
    context.state = newState
    context.updatedAt = Date.now()
    // 進入新狀態
    if (newHandler) {
      await newHandler.enter(context)
    }
  }
  /**
   * 檢查是否可以轉換到指定狀態
   */
  canTransitionTo(from: RunStateType, to: RunStateType): boolean {
    const handler = this.handlers.get(from)
    if (!handler) {
      return true // 未註冊的狀態允許任意轉換
    }
    return handler.getAllowedTransitions().includes(to)
  }
  /**
   * 取得當前狀態
   */
  getCurrentState(): RunStateType {
    return this.currentState
  }
}
