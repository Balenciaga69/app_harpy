import { StageType } from '../../domain/stage/Stage'
import { RandomHelper } from '../../shared/helpers/RandomHelper'
// TODO: 未來搬到 env 配置 (目前暫時不處理)
const LEVEL_COUNT = 10
const ELITE_POSITION = 5
const BOSS_POSITION = 10
const EVENT_PROBABILITY = 0.12

const create = (seed: number) => {
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
    })()
    result[i] = stageType
  }
  return result
}

export const StageNodesCreator = {
  create: create,
}
