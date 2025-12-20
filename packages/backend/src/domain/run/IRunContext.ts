import { ChapterLevel } from '../../shared/models/TemplateWeightInfo'
import { StageType } from '../stage/Stage'

export interface IRunContext {
  id: string
  seed: number
  gold: number
  currentChapter: ChapterLevel
  currentStage: number
  encounteredEnemyIds: string[]
  chapters: Record<ChapterLevel, ChapterInfo>
}

interface ChapterInfo {
  stageNodes: Record<number, StageType>
}
