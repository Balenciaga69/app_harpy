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
}
