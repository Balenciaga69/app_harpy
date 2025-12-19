import { EnemyTemplate } from '../../domain/entity/Enemy'
import { LevelType } from '../../domain/level/LevelType'
import { IRunContext } from '../../domain/run/IRunContext'
import { RandomHelper } from '../../shared/helpers/RandomHelper'

// TODO: 記得搬運到 application 層
const LEVEL_COUNT = 10
const ELITE_POSITION = 5
const BOSS_POSITION = 10
const EVENT_PROBABILITY = 0.12

const createLevelNodes = (seed: number) => {
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

const enemyLevelInstanceGenerator = (ctx: IRunContext) => {
  // step1: 篩合理敵人函數
  // step2: 隨機選一位
  // step3: 套用難度係數與 level 資訊
  // step4: 回傳實體
}
// export interface EnemyLevelInstance {
//   id: string
//   type: 'ELITE' | 'BOSS' | 'NORMAL'
//   enemy: EnemyInstance
// }

export interface EnemyWeight {
  readonly templateId: string
  readonly weight: number
}

const EnemyTemplates: EnemyTemplate[] = []

const EnemyWeightList: EnemyWeight[] = [
  { templateId: '獵手', weight: 10 },
  { templateId: '忍者', weight: 10 },
  { templateId: '巫醫', weight: 10 },
  { templateId: '稀有泰坦', weight: 1 },
]

export interface EnemyEncounterChapter {
  readonly templateId: string
  readonly chapters: Set<1 | 2 | 3>
}

const EnemyEncounterChapterList: EnemyEncounterChapter[] = [
  { templateId: '獵手', chapters: new Set([1]) },
  { templateId: '忍者', chapters: new Set([2]) },
  { templateId: '巫醫', chapters: new Set([3]) },
  { templateId: '稀有泰坦', chapters: new Set([1, 2, 3]) },
]
