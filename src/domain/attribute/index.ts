/**
 * Domain - Attribute Module
 *
 * 屬性系統的共享定義層。
 * 這是最基礎的共用詞彙，所有模組都會依賴此定義。
 */
export { AttributeDefaults, AttributeLimits } from './attribute-constants'
export type { AttributeLimitKey } from './attribute-constants'
export type { AttributeType } from './attribute-type'
export { createDefaultAttributes } from './attribute-values'
export type { BaseAttributeValues } from './attribute-values'
