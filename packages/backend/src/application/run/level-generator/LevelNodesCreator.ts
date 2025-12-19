import { LevelType } from '../../../domain/level'
import { RandomHelper } from '../../../shared/helpers/RandomHelper'

const LEVEL_COUNT = 10
const ELITE_POSITION = 5
const BOSS_POSITION = 10
const EVENT_PROBABILITY = 0.12

const create = (seed: number) => {
  const result: Record<number, LevelType> = {}
  const rngHelper = new RandomHelper(seed)
  for (let i = 1; i <= LEVEL_COUNT; i++) {
    const levelType = (() => {
      switch (true) {
        case i === ELITE_POSITION:
          return 'ELITE'
        case i === BOSS_POSITION:
          return 'BOSS'
        default:
          return rngHelper.next() < EVENT_PROBABILITY ? 'EVENT' : 'NORMAL'
      }
    })()
    result[i] = levelType
  }
  return result
}

export const LevelNodesCreator = {
  create: create,
}
