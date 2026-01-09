import { RelicRecord } from '../../../../domain/item/Item'
import { UltimateRecord } from '../../../../domain/ultimate/Ultimate'
import { ChapterLevel } from '../../../../shared/models/TemplateWeightInfo'
import { ApplicationErrorCode } from '../../../../shared/result/ErrorCodes'
import { Result } from '../../../../shared/result/Result'
import { ICharacterContext } from '../../../core-infrastructure/context/interface/ICharacterContext'
import { ChapterInfo, IRunContext } from '../../../core-infrastructure/context/interface/IRunContext'
import { IShopContext } from '../../../core-infrastructure/context/interface/IShopContext'
import { IStashContext } from '../../../core-infrastructure/context/interface/IStashContext'
import { IStageNodeGenerationService } from '../stage-progression/service/StageNodeGenerationService'
const INITIAL_VERSION = 1
const DEFAULT_CHAPTER_LEVELS: ChapterLevel[] = [1, 2, 3]
const DEFAULT_REMAINING_FAIL_RETRIES = 3
export function buildRunContext(
  runId: string,
  seed: number,
  stageGenerator: IStageNodeGenerationService
): Result<IRunContext, ApplicationErrorCode.敵人_關卡資訊無效> {
  const chapters: Record<ChapterLevel, ChapterInfo> = {} as Record<ChapterLevel, ChapterInfo>
  try {
    for (const ch of DEFAULT_CHAPTER_LEVELS) {
      chapters[ch] = { stageNodes: stageGenerator.generateStageNodes(seed + ch) }
    }
  } catch {
    return Result.fail(ApplicationErrorCode.敵人_關卡資訊無效)
  }
  return Result.success({
    runId,
    version: INITIAL_VERSION,
    seed,
    currentChapter: 1 as ChapterLevel,
    currentStage: 1,
    encounteredEnemyIds: [],
    chapters,
    remainingFailRetries: DEFAULT_REMAINING_FAIL_RETRIES,
    rollModifiers: [],
    status: 'IDLE',
    temporaryContext: {},
  })
}
export function buildCharacterContext(
  runId: string,
  professionId: string,
  characterName: string,
  relicRecords: RelicRecord[],
  ultimateRecord: UltimateRecord
): ICharacterContext {
  const characterId = `${runId}-char`
  return {
    runId,
    version: INITIAL_VERSION,
    id: characterId,
    name: characterName,
    professionId,
    relics: relicRecords,
    gold: 100,
    ultimate: ultimateRecord,
    loadCapacity: 2,
    currentLoad: 0,
  }
}
export function buildStashContext(runId: string): IStashContext {
  return {
    runId,
    version: INITIAL_VERSION,
    capacity: 20,
    items: [],
  }
}
export function buildShopContext(runId: string): IShopContext {
  return {
    runId,
    version: INITIAL_VERSION,
    shopConfigId: 'DEFAULT',
    items: [],
  }
}
