import { StageType } from '../../../domain/stage/StageType'
import { RandomHelper } from '../../../shared/helpers/RandomHelper'

// TODO: 未來搬到 env 配置 (目前暫時不處理)
const LEVEL_COUNT = 10 // 單一章節關卡數
const ELITE_POSITION = 5 // 菁英關卡
const BOSS_POSITION = 10 // 首領關卡
const EVENT_PROBABILITY = 0.12 // 事件生成機率

export type StageNodeMap = Record<number, StageType>

export interface IStageNodeGenerationService {
  generateStageNodes(seed: number): StageNodeMap
}

/* 協調關卡節點生成的服務 */
export class StageNodeGenerationService implements IStageNodeGenerationService {
  /* 為新章節生成所有關卡節點 */
  generateStageNodes(seed: number): StageNodeMap {
    return this.create(seed)
  }

  /* 內部實現：建立關卡節點 */
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
