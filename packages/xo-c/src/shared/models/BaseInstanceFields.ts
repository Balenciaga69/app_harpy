import { ChapterLevel } from './TemplateWeightInfo'
export interface BaseInstanceFields {
  readonly id: string
  readonly templateId: string
}
export interface WithCreatedInfo {
  readonly atCreated: AtCreatedInfo
}
export interface WithSourceUnit {
  readonly sourceUnitId: string
}
export interface AtCreatedInfo {
  readonly chapter: ChapterLevel
  readonly stage: number
  readonly difficulty: number
}
