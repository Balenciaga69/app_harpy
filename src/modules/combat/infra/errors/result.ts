/**
 * Result<T, F>
 *
 * A type-safe container for operation results that may succeed or fail.
 * Inspired by Railway-Oriented Programming and Rust's Result type.
 *
 * Usage:
 * - T: Success value type (e.g., ICharacter, DamageEvent)
 * - F: Failure type (e.g., CombatFailure)
 *
 * This pattern avoids throwing exceptions in combat loop,
 * making error handling explicit and composable.
 */
export class Result<T, F> {
  private readonly _value?: T
  private readonly _failure?: F
  private readonly _isOk: boolean
  private constructor(isOk: boolean, value?: T, failure?: F) {
    this._isOk = isOk
    this._value = value
    this._failure = failure
  }
  /** Create a success result */
  static ok<T, F>(value: T): Result<T, F> {
    return new Result<T, F>(true, value, undefined)
  }
  /** Create a failure result */
  static fail<T, F>(failure: F): Result<T, F> {
    return new Result<T, F>(false, undefined, failure)
  }
  /** Check if result is success */
  isOk(): boolean {
    return this._isOk
  }
  /** Check if result is failure */
  isFail(): boolean {
    return !this._isOk
  }
  /** Get success value (throws if failure) */
  get value(): T {
    if (!this._isOk) {
      throw new Error('Cannot get value from failed Result. Check isOk() first.')
    }
    return this._value as T
  }
  /** Get failure info (throws if success) */
  get failure(): F {
    if (this._isOk) {
      throw new Error('Cannot get failure from successful Result. Check isFail() first.')
    }
    return this._failure as F
  }
  /** Get value or return default */
  getOrDefault(defaultValue: T): T {
    return this._isOk ? (this._value as T) : defaultValue
  }
  /** Get value or execute fallback function */
  getOrElse(fallback: (failure: F) => T): T {
    return this._isOk ? (this._value as T) : fallback(this._failure as F)
  }
  /** Transform success value, pass through failure */
  map<U>(fn: (value: T) => U): Result<U, F> {
    if (this._isOk) {
      return Result.ok(fn(this._value as T))
    }
    return Result.fail(this._failure as F)
  }
  /** Chain operations that return Result */
  flatMap<U>(fn: (value: T) => Result<U, F>): Result<U, F> {
    if (this._isOk) {
      return fn(this._value as T)
    }
    return Result.fail(this._failure as F)
  }
  /** Execute side effect on success */
  onOk(fn: (value: T) => void): Result<T, F> {
    if (this._isOk) {
      fn(this._value as T)
    }
    return this
  }
  /** Execute side effect on failure */
  onFail(fn: (failure: F) => void): Result<T, F> {
    if (!this._isOk) {
      fn(this._failure as F)
    }
    return this
  }
}
