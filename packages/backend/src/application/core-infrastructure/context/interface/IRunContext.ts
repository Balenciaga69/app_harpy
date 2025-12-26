import { ChapterLevel } from '../../../../shared/models/TemplateWeightInfo'
import { ItemRollModifier } from '../../../../domain/item/roll/ItemRollModifier'
import { StageType } from '../../../../domain/stage/StageType'
import { WithRunIdAndVersion } from './WithRunIdAndVersion'
export interface IRunContext extends WithRunIdAndVersion {
  readonly seed: number
  readonly gold: number
  readonly currentChapter: ChapterLevel
  readonly currentStage: number
  readonly encounteredEnemyIds: string[]
  readonly chapters: Record<ChapterLevel, ChapterInfo>
  readonly rollModifiers: ItemRollModifier[]
}
export interface ChapterInfo {
  readonly stageNodes: Record<number, StageType>
}
