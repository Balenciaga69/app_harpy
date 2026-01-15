import { PostCombatContext } from '../../../../domain/post-combat/PostCombat'
import { IRunFields } from '../../../../domain/run/Run'
import { StageType } from '../../../../domain/stage/StageType'
import { WithRunIdAndVersion } from './WithRunIdAndVersion'
export interface IRunContext extends WithRunIdAndVersion, IRunFields {
  readonly temporaryContext: {
    postCombat?: PostCombatContext
  }
}
export interface ChapterInfo {
  readonly stageNodes: Record<number, StageType>
}
