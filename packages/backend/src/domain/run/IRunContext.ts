import { StageType } from '../stage'

export interface IRunContext {
  id: string
  seed: number
  gold: number
  currentChapter: number
  currentStage: number
  encounteredEnemyIds: string[]
  chapters: Record<number, ChapterInfo>
}

interface ChapterInfo {
  stageNodes: Record<number, StageType>
}
