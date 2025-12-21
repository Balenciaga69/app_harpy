import { ChapterLevel } from '../../shared/models/TemplateWeightInfo'
import { ItemRollModifier } from '../item/roll/ItemRollModifier'
import { StageType } from '../stage/Stage'

export interface IRunContext {
  readonly id: string
  readonly seed: number
  readonly gold: number
  readonly currentChapter: ChapterLevel
  readonly currentStage: number
  readonly encounteredEnemyIds: string[]
  readonly chapters: Record<ChapterLevel, ChapterInfo>
  readonly rollModifiers: ItemRollModifier[]
}

interface ChapterInfo {
  readonly stageNodes: Record<number, StageType>
}
