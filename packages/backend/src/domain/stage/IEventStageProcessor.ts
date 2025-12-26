import { ChapterLevel } from '../../shared/models/TemplateWeightInfo'

/** 事件階段處理器，定義事件觸發與執行的邏輯 */
export interface IEventStageProcessor {
  canTrigger: (ctx: StageProcessorContext) => boolean
  process: (ctx: StageProcessorContext) => void
}

/** 階段處理器上下文，提供事件判定所需的遊戲進度與歷史信息 */
export interface StageProcessorContext {
  readonly seed: number
  readonly currentChapter: ChapterLevel
  readonly currentStage: number
  readonly encounteredEnemyIds: string[]
}
