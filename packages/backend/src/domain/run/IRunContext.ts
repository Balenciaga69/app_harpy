import { LevelType } from '../level'

export interface IRunContext {
  id: string
  seed: number
  currentChapter: number
  currentLevel: number
  gold: number
  chapters: Record<number, ChapterInfo>
}
interface ChapterInfo {
  levelNodes: Record<number, LevelType>
  encounteredEnemyIds: Set<string>
}
