import { RandomHelper } from '../../shared/helpers/RandomHelper'
import { EnemyTemplate } from '../entity/Enemy'
import { LevelType } from '../level/LevelType'

export interface IRunContext {
  id: string
  seed: number
  currentChapter: number
  currentLevel: number
  gold: number
  chapters: Record<number, ChapterInfo>
}
interface ChapterInfo {
  levelNodes: Record<number, LevelType>
  encounteredEnemyIds: Set<string>
}

// TODO: 記得搬運到 application 層
const LEVEL_COUNT = 10
const ELITE_POSITION = 5
const BOSS_POSITION = 10
const EVENT_PROBABILITY = 0.12

const CreateLevelNodes = (seed: number) => {
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

const EnemyLevelInstanceGenerator = (ctx: IRunContext) => {
  // step1: 篩合理敵人函數
  const filteredEnemies = filterEnemy(ctx)
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
  readonly enemyId: string
  readonly weight: number
}

const EnemyTemplates: EnemyTemplate[] = []

const EnemyWeightList: EnemyWeight[] = [
  { enemyId: '獵手', weight: 10 },
  { enemyId: '忍者', weight: 10 },
  { enemyId: '巫醫', weight: 10 },
  { enemyId: '稀有泰坦', weight: 1 },
]

export interface EnemyEncounterChapter {
  readonly enemyId: string
  readonly chapters: Set<1 | 2 | 3>
}

const EnemyEncounterChapterList: EnemyEncounterChapter[] = [
  { enemyId: '獵手', chapters: new Set([1]) },
  { enemyId: '忍者', chapters: new Set([2]) },
  { enemyId: '巫醫', chapters: new Set([3]) },
  { enemyId: '稀有泰坦', chapters: new Set([1, 2, 3]) },
]

const filterEnemy = (
  enemyTemplates: EnemyTemplate[],
  enemyEncounterChapters: EnemyEncounterChapter[],
  currentChapter: number,
  encounteredEnemyIds: Set<string>
): EnemyTemplate[] => {
  return enemyTemplates.filter((template) => {
    return (
      isEnemyAvailableInChapter(template.id, enemyEncounterChapters, currentChapter) &&
      isEnemyNotEncountered(template.id, encounteredEnemyIds)
    )
  })
}

/**
 * Checks if an enemy is available in the specified chapter.
 * @param enemyId - The ID of the enemy.
 * @param enemyEncounterChapters - Map of enemy IDs to allowed chapters.
 * @param chapter - The chapter number to check.
 * @returns True if the enemy is available in the chapter.
 */
const isEnemyAvailableInChapter = (
  enemyId: string,
  enemyEncounterChapters: EnemyEncounterChapter[],
  chapter: number
): boolean => {
  const encounterChapters = enemyEncounterChapters.find((eec) => eec.enemyId === enemyId)?.chapters
  return encounterChapters?.has(chapter as 1 | 2 | 3) ?? false
}

/**
 * Checks if an enemy has not been encountered.
 * @param enemyId - The ID of the enemy.
 * @param encounteredEnemyIds - Set of encountered enemy IDs.
 * @returns True if the enemy has not been encountered.
 */
const isEnemyNotEncountered = (enemyId: string, encounteredEnemyIds: Set<string>): boolean => {
  return !encounteredEnemyIds.has(enemyId)
}

// Usage in EnemyLevelInstanceGenerator (assuming injection of dependencies)
const EnemyLevelInstanceGenerator = (ctx: IRunContext, levelType: LevelType, seed: number): EnemyLevelInstance => {
  // step1: 篩選合理敵人函數
  const currentChapterInfo = ctx.chapters[ctx.currentChapter]
  const encounteredEnemyIds = currentChapterInfo ? currentChapterInfo.encounteredEnemyIds : new Set<string>()
  const filteredEnemies = filterEnemy(
    EnemyTemplates,
    EnemyEncounterChapterList,
    ctx.currentChapter,
    encounteredEnemyIds
  )
  // ... rest of the steps ...
}
