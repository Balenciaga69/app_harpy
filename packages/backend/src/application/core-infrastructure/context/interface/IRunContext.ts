import { ChapterLevel } from '../../../../shared/models/TemplateWeightInfo'
import { ItemRollModifier } from '../../../../domain/item/roll/ItemRollModifier'
import { StageType } from '../../../../domain/stage/StageType'
import { WithRunIdAndVersion } from './WithRunIdAndVersion'
import { PostCombatContext } from '../../../../domain/post-combat/PostCombat'
import { RunStatus } from '../../run-status/RunStatus'
export interface IRunContext extends WithRunIdAndVersion {
  readonly seed: number
  readonly currentChapter: ChapterLevel
  readonly currentStage: number
  readonly encounteredEnemyIds: string[]
  readonly chapters: Record<ChapterLevel, ChapterInfo>
  readonly rollModifiers: ItemRollModifier[]
  readonly remainingFailRetries: number
  readonly status: RunStatus
  readonly temporaryContext: {
    postCombat?: PostCombatContext
  }
}
export interface ChapterInfo {
  readonly stageNodes: Record<number, StageType>
}
