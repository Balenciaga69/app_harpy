import { ChapterLevel } from './TemplateWeightInfo'
/**
 * 所有 Instance 都會包含的欄位
 */
export interface BaseInstanceFields {
  readonly id: string
  readonly templateId: string
}
/**
 * 包含建立資訊的附加介面
 */
export interface WithCreatedInfo {
  readonly atCreated: AtCreatedInfo
}
/**
 * 包含來源單位 ID 的附加介面
 */
export interface WithSourceUnit {
  readonly sourceUnitId: string
}
/**
 * 被建立的關卡與當下難度資訊
 */
export interface AtCreatedInfo {
  readonly chapter: ChapterLevel
  readonly stage: number
  readonly difficulty: number
}
