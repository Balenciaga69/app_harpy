import { StageType } from '../stage/StageType'
export type RunStatus = 'IDLE' | 'PRE_COMBAT' | 'IN_COMBAT' | 'POST_COMBAT' | 'COMPLETED'
export interface ChapterInfo {
  readonly stageNodes: Record<number, StageType> // 關卡節點資訊
}
