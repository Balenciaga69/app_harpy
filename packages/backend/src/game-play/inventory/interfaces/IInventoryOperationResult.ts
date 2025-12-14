/**
 * Inventory Operation Result
 *
 * 庫存操作結果結構，包含成功/失敗狀態與更新後資料
 */
export interface IInventoryOperationResult<T = void> {
  /** 操作是否成功 */
  readonly success: boolean
  /** 失敗原因（若失敗） */
  readonly error?: string
  /** 回傳資料（若成功） */
  readonly data?: T
}
