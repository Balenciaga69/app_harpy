import { nanoid } from 'nanoid'
import type { RunContext } from '../models/run-context'
import { createInitialContext } from '../models/run-context'
import { RunState } from '../models/run-state'
/**
 * Run 初始化器
 * 負責建立新的 Run 實例
 */
export class RunInitializer {
  /**
   * 建立新的 Run
   */
  createNewRun(): RunContext {
    const runId = nanoid()
    const context = createInitialContext(runId)
    context.state = RunState.CHARACTER_SELECTION
    return context
  }
  /**
   * 從檢查點恢復 Run
   */
  restoreFromCheckpoint(savedContext: RunContext): RunContext {
    // 驗證與恢復
    return {
      ...savedContext,
      updatedAt: Date.now(),
    }
  }
}
