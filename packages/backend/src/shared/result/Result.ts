/**
 * Result 類別 - 表示一個可能成功或失敗的操作結果
 *
 * 用途：處理預期內的業務邏輯失敗（例如：裝備欄滿、金幣不足）
 * 注意：系統性故障（資料庫連線、Bug）應該繼續拋出 Exception
 *
 * 使用方式：
 * - 成功: Result.success(value)
 * - 失敗: Result.fail(error)
 * - 檢查: result.isSuccess / result.isFailure
 * - 提取值: result.value (成功) / result.error (失敗)
 * - 鏈式操作: result.map(...).flatMap(...)
 */
export class Result<T, E = string> {
  private constructor(
    readonly isSuccess: boolean,
    readonly value: T | null,
    readonly error: E | null
  ) {}
  /** 建立成功的 Result*/
  static success<T, E = string>(value: T): Result<T, E> {
    return new Result(true, value, null) as Result<T, E>
  }
  /** 建立失敗的 Result*/
  static fail<T, E = string>(error: E): Result<T, E> {
    return new Result(false, null, error) as Result<T, E>
  }
  /** 檢查是否失敗的便捷屬性*/
  get isFailure(): boolean {
    return !this.isSuccess
  }
  /** 映射成功值，保持失敗狀態不變*/
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFailure) {
      return Result.fail(this.error!)
    }
    return Result.success(fn(this.value!))
  }
  /** 映射成功值並返回新的 Result，可用於鏈式操作*/
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isFailure) {
      return Result.fail(this.error!)
    }
    return fn(this.value!)
  }
  /** 映射失敗值，保持成功狀態不變*/
  mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this.isSuccess) {
      return Result.success(this.value!)
    }
    return Result.fail(fn(this.error!))
  }
  /** 透過回調函數處理結果（成功或失敗）*/
  fold<U>(onFailure: (error: E) => U, onSuccess: (value: T) => U): U {
    return this.isSuccess ? onSuccess(this.value!) : onFailure(this.error!)
  }
  /** 執行副作用，不改變 Result*/
  tap(fn: (value: T) => void): Result<T, E> {
    if (this.isSuccess) {
      fn(this.value!)
    }
    return this
  }
  /** 獲取值，失敗時拋出異常（用於 Result 被確認成功時）*/
  getOrThrow(message?: string): T {
    if (this.isSuccess) {
      return this.value!
    }
    throw new Error(message || `Result failed: ${this.error}`)
  }
  /** 獲取值，失敗時返回預設值*/
  getOrElse(defaultValue: T): T {
    return this.isSuccess ? this.value! : defaultValue
  }
  /** 組合多個 Result，只要有一個失敗就返回失敗*/
  static combine<T extends any[], E>(results: Result<any, E>[]): Result<T, E> {
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.error!)
      }
    }
    const values = results.map((r) => r.value) as unknown as T
    return Result.success(values)
  }
}
