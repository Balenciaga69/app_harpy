import { RunStatus } from '../../../domain/run/RunTypes'
import { DomainErrorCode } from '../../../shared/result/ErrorCodes'
import { Result } from '../../../shared/result/Result'
const ALLOWED_TRANSITIONS: Record<RunStatus, RunStatus[]> = {
  IDLE: ['PRE_COMBAT'],
  PRE_COMBAT: ['IN_COMBAT'],
  IN_COMBAT: ['POST_COMBAT'],
  POST_COMBAT: ['IDLE', 'COMPLETED'],
  COMPLETED: [],
}
const validateTransition = (current: RunStatus, next: RunStatus): Result<void, string> => {
  const allowedNextStates = ALLOWED_TRANSITIONS[current]
  if (!allowedNextStates?.includes(next)) {
    return Result.fail(DomainErrorCode.Run_非法狀態轉換)
  }
  return Result.success(undefined)
}
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
export const RunStatusGuard = {
  validateTransition,
  requireStatus,
}
