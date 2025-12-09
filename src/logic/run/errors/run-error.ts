/**
 * Run 模組專用錯誤類別
 */
export class RunError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RunError'
    Object.setPrototypeOf(this, RunError.prototype)
  }
}
/**
 * 狀態轉換非法錯誤
 */
export class InvalidStateTransitionError extends RunError {
  constructor(from: string, to: string) {
    super(`無法從 ${from} 轉換到 ${to}`)
    this.name = 'InvalidStateTransitionError'
  }
}
/**
 * Run 尚未初始化錯誤
 */
export class RunNotInitializedError extends RunError {
  constructor() {
    super('Run 尚未初始化，請先調用 startNewRun()')
    this.name = 'RunNotInitializedError'
  }
}
/**
 * 無效的操作錯誤
 */
export class InvalidRunOperationError extends RunError {
  constructor(operation: string, reason: string) {
    super(`無法執行操作 ${operation}: ${reason}`)
    this.name = 'InvalidRunOperationError'
  }
}
