import { StageType } from '../../../../../domain/stage/StageType'
import { RandomHelper } from '../../../../../shared/helpers/RandomHelper'
 TODO: 未來搬到 env 配置 (目前暫時不處理)

const LEVEL_COUNT = 10

const ELITE_POSITION = 5

const BOSS_POSITION = 10

const EVENT_PROBABILITY = 0.12

export type StageNodeMap = Record<number, StageType>

export interface IStageNodeGenerationService {
  generateStageNodes(seed: number): StageNodeMap
}

export class StageNodeGenerationService implements IStageNodeGenerationService {
  generateStageNodes(seed: number): StageNodeMap {
    return this.create(seed)
  }
  private create(seed: number): StageNodeMap {
    const result: Record<number, StageType> = {}
    const rngHelper = new RandomHelper(seed)
    for (let i = 1; i <= LEVEL_COUNT; i++) {
      result[i] = this.determineStageType(i, rngHelper)
    }
    return result
  }
  private determineStageType(position: number, rng: RandomHelper): StageType {
    if (position === ELITE_POSITION) return 'ELITE'
    if (position === BOSS_POSITION) return 'BOSS'
    return rng.next() < EVENT_PROBABILITY ? 'EVENT' : 'NORMAL'
  }
}
