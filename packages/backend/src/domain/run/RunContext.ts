import { LevelType } from '../level/LevelType'

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
  交手過的敵人ids: Set<string>
}
