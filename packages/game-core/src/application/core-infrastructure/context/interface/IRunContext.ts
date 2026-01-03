import { PostCombatContext } from '../../../../domain/post-combat/PostCombat'
import { IRunFields } from '../../../../domain/run/Run'
import { StageType } from '../../../../domain/stage/StageType'
import { WithRunIdAndVersion } from './WithRunIdAndVersion'
export interface IRunContext extends WithRunIdAndVersion, IRunFields {
  readonly temporaryContext: {
    // 臨時非全程存在的上下文資料
    postCombat?: PostCombatContext // 戰鬥後事務
  }
}
export interface ChapterInfo {
  readonly stageNodes: Record<number, StageType> // 關卡節點資訊
}
