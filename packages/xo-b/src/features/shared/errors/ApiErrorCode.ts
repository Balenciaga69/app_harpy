export enum ApiErrorCode {
  認證_未提供認證 = 'AUTH_MISSING',
  認證_認證無效 = 'AUTH_INVALID',
  認證_令牌過期 = 'AUTH_EXPIRED',
  授權_權限不足 = 'FORBIDDEN',
  參數_驗證失敗 = 'VALIDATION_FAILED',
  參數_不存在 = 'NOT_FOUND',
  伺服器_內部錯誤 = 'INTERNAL_ERROR',
}
export const ApiErrorMessages: Record<ApiErrorCode, string> = {
  [ApiErrorCode.認證_未提供認證]: '未提供認證資訊',
  [ApiErrorCode.認證_認證無效]: '認證資訊無效',
  [ApiErrorCode.認證_令牌過期]: '令牌已過期，請重新登入',
  [ApiErrorCode.授權_權限不足]: '權限不足，無法進行此操作',
  [ApiErrorCode.參數_驗證失敗]: '請求參數驗證失敗',
  [ApiErrorCode.參數_不存在]: '資源不存在',
  [ApiErrorCode.伺服器_內部錯誤]: '伺服器內部錯誤',
}
