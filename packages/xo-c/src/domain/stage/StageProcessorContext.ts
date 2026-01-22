import { ChapterLevel } from '../../shared/models/TemplateWeightInfo'
export interface IEventStageProcessor {
  canTrigger: (context: StageProcessorContext) => boolean
  process: (context: StageProcessorContext) => void
}
export interface StageProcessorContext {
  readonly seed: number
  readonly currentChapter: ChapterLevel
  readonly currentStage: number
  readonly encounteredEnemyIds: string[]
}
