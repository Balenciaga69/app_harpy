/**
 * 遊戲通用錯誤類別
 * 集中管理所有自定義錯誤，便於錯誤處理與分類
 */

/** 基礎遊戲錯誤類別 */
export abstract class GameError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly meta?: any
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

/** 配置未找到錯誤：當靜態配置資源不存在時拋出 */
export class ConfigNotFoundError extends GameError {
  constructor(resourceType: string, resourceId: string) {
    super(`${resourceType} 配置不存在: ${resourceId}`, 'CONFIG_NOT_FOUND', { resourceType, resourceId })
  }
}

/** 版本衝突錯誤：當樂觀鎖檢查失敗時拋出 */
export class VersionConflictError extends GameError {
  constructor(message: string, meta?: any) {
    super(message, 'VERSION_CONFLICT', meta)
  }
}

/** 業務規則違反錯誤：當違反遊戲業務邏輯時拋出 */
export class BusinessRuleViolationError extends GameError {
  constructor(rule: string, details?: string) {
    super(`違反業務規則: ${rule}${details ? ` - ${details}` : ''}`, 'BUSINESS_RULE_VIOLATION', { rule, details })
  }
}
