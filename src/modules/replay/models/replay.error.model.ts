/**
 * Replay error codes for categorizing errors
 */
export type ReplayErrorCode = 'NOT_LOADED' | 'INVALID_DATA' | 'INVALID_TICK' | 'INVALID_SPEED' | 'INVALID_STATE'
/**
 * ReplayError
 *
 * Custom error class for replay system.
 * Provides better error context and debugging information.
 */
export class ReplayError extends Error {
  public readonly code: ReplayErrorCode
  public readonly context?: Record<string, unknown>
  constructor(message: string, code: ReplayErrorCode, context?: Record<string, unknown>) {
    super(message)
    this.name = 'ReplayError'
    this.code = code
    this.context = context
    // Maintain proper stack trace (only available in V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ReplayError)
    }
  }
}
