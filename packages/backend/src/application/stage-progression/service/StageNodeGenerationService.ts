import { StageType } from '../../../domain/stage/StageType'
import { RandomHelper } from '../../../shared/helpers/RandomHelper'

// TODO: 未來搬到 env 配置 (目前暫時不處理)
/** 單一章節的總關卡數 */
const LEVEL_COUNT = 10
/** 菁英關卡位置 */
const ELITE_POSITION = 5
/** 首領關卡位置 */
const BOSS_POSITION = 10
/** 事件關卡生成機率 */
const EVENT_PROBABILITY = 0.12

/** 關卡節點映射：位置 → 關卡類型 */
export type StageNodeMap = Record<number, StageType>

/** 關卡節點生成服務介面 */
export interface IStageNodeGenerationService {
  generateStageNodes(seed: number): StageNodeMap
}

/**
 * 關卡節點生成服務：為章節生成所有關卡節點
 * 職責：根據規則生成關卡類型分佈(菁英、首領、事件、一般)
 */
export class StageNodeGenerationService implements IStageNodeGenerationService {
  /**
   * 為新章節生成所有關卡節點的類型分佈
   * 流程：
   *   1. 第 5 關固定為菁英關卡
   *   2. 第 10 關固定為首領關卡
   *   3. 其他關卡根據機率骰選事件或一般
   * 邊界：關卡數固定為 10(由常數定義)
   * 副作用：無(純生成邏輯)
   */
  generateStageNodes(seed: number): StageNodeMap {
    return this.create(seed)
  }

  /** 內部實現：建立關卡節點映射 */
  private create(seed: number): StageNodeMap {
    const result: Record<number, StageType> = {}
    const rngHelper = new RandomHelper(seed)
    for (let i = 1; i <= LEVEL_COUNT; i++) {
      const stageType = (() => {
        switch (true) {
          case i === ELITE_POSITION:
            return 'ELITE'
          case i === BOSS_POSITION:
            return 'BOSS'
          default:
            return rngHelper.next() < EVENT_PROBABILITY ? 'EVENT' : 'NORMAL'
        }
      })() as StageType
      result[i] = stageType
    }
    return result
  }
}
