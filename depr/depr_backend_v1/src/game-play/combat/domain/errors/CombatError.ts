import type { CombatFailure, FailureCode } from '../../interfaces/errors/CombatFailure'
import { CombatFailureCode } from '../../interfaces/errors/CombatFailure'
/**
 * CombatError
 *
 * Error class for combat system boundary layer.
 * Only thrown at CombatEngine.start() level, never inside combat loop.
 *
 * Converts internal CombatFailure to throwable Error for external consumers.
 */
export class CombatError extends Error {
  readonly code: FailureCode
  readonly context?: Record<string, unknown>
  readonly tick?: number
  readonly failures: CombatFailure[]
  constructor(message: string, code: FailureCode = CombatFailureCode.UNKNOWN, failures: CombatFailure[] = []) {
    super(message)
    this.name = 'CombatError'
    this.code = code
    this.failures = failures
    // Extract context from first failure if available
    if (failures.length > 0) {
      this.context = failures[0]?.context
      this.tick = failures[0]?.tick
    }
    // Maintain proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CombatError)
    }
  }
  /** Create from a single CombatFailure */
  static fromFailure(failure: CombatFailure): CombatError {
    return new CombatError(failure.message, failure.code, [failure])
  }
  /** Create from multiple CombatFailures */
  static fromFailures(failures: CombatFailure[], message?: string): CombatError {
    const msg = message ?? failures.map((f) => f.message).join('; ')
    const code = failures[0]?.code ?? CombatFailureCode.UNKNOWN
    return new CombatError(msg, code, failures)
  }
  /** Get summary of all failures */
  getSummary(): string {
    if (this.failures.length === 0) {
      return this.message
    }
    return this.failures.map((f) => `[${f.code}] ${f.message}`).join('\n')
  }
}
