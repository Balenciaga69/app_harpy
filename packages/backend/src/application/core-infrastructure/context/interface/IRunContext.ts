import { ItemRollModifier } from '../../../../domain/item/roll/ItemRollModifier'
import { PostCombatContext } from '../../../../domain/post-combat/PostCombat'
import { StageType } from '../../../../domain/stage/StageType'
import { ChapterLevel } from '../../../../shared/models/TemplateWeightInfo'
import { RunStatus } from '../../run-status/RunStatus'
import { WithRunIdAndVersion } from './WithRunIdAndVersion'
export interface IRunContext extends WithRunIdAndVersion {
  readonly seed: number // 運行隨機種子
  readonly currentChapter: ChapterLevel // 目前所在章節
  readonly currentStage: number // 目前所在關卡
  readonly encounteredEnemyIds: string[] // 已遇到的敵人ID列表
  readonly chapters: Record<ChapterLevel, ChapterInfo> // 章節資訊
  readonly rollModifiers: ItemRollModifier[] // 物品生成用的修飾符
  readonly remainingFailRetries: number // 剩餘重試次數
  readonly status: RunStatus // 目前玩家所處的階段狀態
  readonly temporaryContext: {
    // 臨時非全程存在的上下文資料
    postCombat?: PostCombatContext // 戰鬥後事務
  }
}
export interface ChapterInfo {
  readonly stageNodes: Record<number, StageType> // 關卡節點資訊
}
