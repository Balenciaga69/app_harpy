import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'

/** 物品生成的額外限制，用於特定情境下的物品篩選與約束 */
export interface ItemRollConstraint {
  readonly templateId: string
  readonly chapters?: ChapterLevel[]
  readonly eventIds?: string[]
  readonly enemyIds?: string[]
  readonly professionIds?: string[]
}
