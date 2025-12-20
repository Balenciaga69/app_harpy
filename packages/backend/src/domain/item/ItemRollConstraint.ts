import { ChapterLevel } from '../../shared/models/TemplateWeightInfo'

/** 物品生成的額外限制 */
export interface ItemRollConstraint {
  templateId: string
  chapters?: ChapterLevel[]
  eventIds?: string[]
  enemyIds?: string[]
}
