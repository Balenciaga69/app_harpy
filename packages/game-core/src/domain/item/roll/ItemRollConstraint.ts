import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'
import { ProfessionType } from '../../profession/Profession'
/** 物品生成的額外限制，用於特定情境下的物品篩選與約束 */
export interface ItemRollConstraint {
  readonly templateId: string
  readonly chapters?: ReadonlyArray<ChapterLevel>
  readonly eventIds?: string[]
  readonly enemyIds?: string[]
  readonly professionTypes?: ReadonlyArray<ProfessionType>
}
