import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'
import { ProfessionType } from '../../profession/Profession'
export interface ItemRollConstraint {
  readonly templateId: string
  readonly chapters?: ReadonlyArray<ChapterLevel>
  readonly eventIds?: string[]
  readonly enemyIds?: string[]
  readonly professionTypes?: ReadonlyArray<ProfessionType>
}
