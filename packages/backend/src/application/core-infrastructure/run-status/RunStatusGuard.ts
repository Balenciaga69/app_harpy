// TODO: AI 自動生成的內容 待觀察是否可用
import { DomainErrorCode } from '../../../shared/result/ErrorCodes'
import { Result } from '../../../shared/result/Result'
import { RunStatus } from './RunStatus'
/** 用於管理 Run 狀態轉換的規則 */
const ALLOWED_TRANSITIONS: Record<RunStatus, RunStatus[]> = {
  IDLE: ['PRE_COMBAT'],
  PRE_COMBAT: ['IN_COMBAT'],
  IN_COMBAT: ['POST_COMBAT'],
  POST_COMBAT: ['IDLE'],
}
/** 驗證 Run 狀態轉換是否合法 */
const validateTransition = (current: RunStatus, next: RunStatus): Result<void, string> => {
  const allowedNextStates = ALLOWED_TRANSITIONS[current]
  if (!allowedNextStates?.includes(next)) {
    return Result.fail(DomainErrorCode.Run_非法狀態轉換)
  }
  return Result.success(undefined)
}
/** 要求 Run 必須處於指定狀態 */
const requireStatus = (current: RunStatus, expectedStatus: RunStatus | RunStatus[]): Result<void, string> => {
  if (Array.isArray(expectedStatus)) {
    if (!expectedStatus.includes(current)) {
      return Result.fail(DomainErrorCode.Run_狀態不符)
    }
  } else {
    if (current !== expectedStatus) {
      return Result.fail(DomainErrorCode.Run_狀態不符)
    }
  }
  return Result.success(undefined)
}
/** Run 狀態守衛 */
export const RunStatusGuard = {
  validateTransition,
  requireStatus,
}
