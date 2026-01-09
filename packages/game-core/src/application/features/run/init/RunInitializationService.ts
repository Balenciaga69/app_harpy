import { RelicRecord } from '../../../../domain/item/Item'
import { UltimateRecord } from '../../../../domain/ultimate/Ultimate'
import { DifficultyHelper } from '../../../../shared/helpers/DifficultyHelper'
import { RandomHelper } from '../../../../shared/helpers/RandomHelper'
import { ChapterLevel } from '../../../../shared/models/TemplateWeightInfo'
import { ApplicationErrorCode } from '../../../../shared/result/ErrorCodes'
import { Result } from '../../../../shared/result/Result'
import { AffixRecordCreateParams, AffixRecordFactory } from '../../../content-generation/factory/AffixFactory'
import { RelicRecordFactory } from '../../../content-generation/factory/RelicFactory'
import { UltimateRecordFactory } from '../../../content-generation/factory/UltimateFactory'
import { IAppContext } from '../../../core-infrastructure/context/interface/IAppContext'
import { ICharacterContext } from '../../../core-infrastructure/context/interface/ICharacterContext'
import { ChapterInfo, IRunContext } from '../../../core-infrastructure/context/interface/IRunContext'
import { IShopContext } from '../../../core-infrastructure/context/interface/IShopContext'
import { IStashContext } from '../../../core-infrastructure/context/interface/IStashContext'
import { IContextUnitOfWork } from '../../../core-infrastructure/context/service/ContextUnitOfWork'
import { IdGeneratorHelper } from '../../../core-infrastructure/id/idGeneratorHelpers'
import {
  IStageNodeGenerationService,
  StageNodeGenerationService,
} from '../stage-progression/service/StageNodeGenerationService'
import { IRunExternalAdapter } from './RunExternalAdapter'
export class RunInitializationService {
  constructor(
    private readonly external: IRunExternalAdapter,
    private readonly unitOfWork: IContextUnitOfWork,
    private readonly stageNodeService?: IStageNodeGenerationService
  ) {}
  async initialize(params: RunInitializationParams): Promise<Result<IAppContext>> {
    const profession = this.external.getProfession(params.professionId)
    if (!profession) {
      return Result.fail(ApplicationErrorCode.初始化_職業不存在)
    }
    const rng = new RandomHelper(params.seed ?? Math.floor(Math.random() * 2 ** 31))
    const runId = IdGeneratorHelper.generateRunId()
    const seed = params.seed ?? Math.floor(rng.next() * 2 ** 31)

    const contextsResult = this.assembleRunContexts(runId, params, seed)
    if (contextsResult.isFailure) {
      return Result.fail(contextsResult.error!)
    }
    const contexts = contextsResult.value!
    this.unitOfWork
      .updateRunContext(contexts.runContext)
      .updateCharacterContext(contexts.characterContext)
      .updateStashContext(contexts.stashContext)
      .updateShopContext(contexts.shopContext)
      .commit()
    return Result.success({ contexts, configStore: this.external.getConfigStore() })
  }
  private assembleRunContexts(
    runId: string,
    params: RunInitializationParams,
    seed: number
  ): Result<{
    runContext: IRunContext
    characterContext: ICharacterContext
    stashContext: IStashContext
    shopContext: IShopContext
  }> {
    const stageService = this.stageNodeService ?? new StageNodeGenerationService()
    const characterId = `${runId}-char`

    const profession = this.external.getProfession(params.professionId)!
    const startingRelicIdsResult = resolveStartingRelicIds(params.startingRelicIds, profession)
    if (startingRelicIdsResult.isFailure) return Result.fail(startingRelicIdsResult.error!)
    const startingRelicIds = startingRelicIdsResult.value!

    const relicRecordsResult = createRelicRecordsForInitialization(startingRelicIds, this.external, characterId)
    if (relicRecordsResult.isFailure) return Result.fail(relicRecordsResult.error!)

    const ultimateRecordResult = createUltimateRecordForInitialization(params, profession, this.external, characterId)
    if (ultimateRecordResult.isFailure) return Result.fail(ultimateRecordResult.error!)

    const runContextResult = buildRunContext(runId, seed, stageService)
    if (runContextResult.isFailure) return Result.fail(runContextResult.error!)
    const characterContext = buildCharacterContext(
      runId,
      params.professionId,
      params.characterName ?? 'Player',
      relicRecordsResult.value!,
      ultimateRecordResult.value!
    )
    const stashContext = buildStashContext(runId)
    const shopContext = buildShopContext(runId)
    return Result.success({ runContext: runContextResult.value!, characterContext, stashContext, shopContext })
  }
}

const INITIAL_VERSION = 1

const DEFAULT_CHAPTER_LEVELS: ChapterLevel[] = [1, 2, 3]

const DEFAULT_REMAINING_FAIL_RETRIES = 3
function resolveStartingRelicIds(
  requested?: string[] | undefined,
  profession?: { startRelicIds: ReadonlyArray<string> }
): Result<string[], ApplicationErrorCode.初始化_起始聖物無效 | ApplicationErrorCode.初始化_起始聖物只能選一個> {
  if (!requested || requested.length === 0) {
    return Result.success([...((profession?.startRelicIds as string[]) ?? [])])
  }
  if (requested.length > 1) return Result.fail(ApplicationErrorCode.初始化_起始聖物只能選一個)
  const allowed = new Set((profession?.startRelicIds as string[]) ?? [])
  for (const id of requested) {
    if (!allowed.has(id)) return Result.fail(ApplicationErrorCode.初始化_起始聖物無效)
  }
  return Result.success(requested)
}
function createRelicRecordsForInitialization(
  startingRelicIds: string[],
  external: IRunExternalAdapter,
  characterId: string
): Result<RelicRecord[], ApplicationErrorCode.初始化_起始聖物無效> {
  if (!startingRelicIds || startingRelicIds.length === 0) return Result.success([])
  const relicTemplates = startingRelicIds
    .map((id) => external.getRelic(id))
    .filter((t): t is NonNullable<typeof t> => t !== undefined)
  if (relicTemplates.length === 0) return Result.fail(ApplicationErrorCode.初始化_起始聖物無效)
  const affixIds = relicTemplates.flatMap((template) => template.affixIds ?? [])
  const initialAffixData: AffixRecordCreateParams = {
    atCreated: { chapter: 1, stage: 1, difficulty: DifficultyHelper.getDifficultyFactor(1, 1) },
    difficulty: DifficultyHelper.getDifficultyFactor(1, 1),
    sourceUnitId: characterId,
  }
  const affixRecords = AffixRecordFactory.createMany(affixIds, initialAffixData)
  const relicRecords = RelicRecordFactory.createMany(startingRelicIds, {
    ...initialAffixData,
    affixRecords,
  })
  return Result.success(relicRecords)
}
/**
 * 根據職業起始大絕招 ID 創建大絕招記錄
 * 優先使用玩家傳遞的 startingUltimateId，否則使用職業的第一個預設大絕招
 *
 * @param params 初始化參數（包含 startingUltimateId）
 * @param profession 職業配置（保證非 null）
 * @param external 外部適配器
 * @param characterId 角色 ID
 * @returns 創建的大絕招記錄或失敗
 */
function createUltimateRecordForInitialization(
  params: RunInitializationParams,
  profession: ReturnType<IRunExternalAdapter['getProfession']>,
  external: IRunExternalAdapter,
  characterId: string
): Result<UltimateRecord, ApplicationErrorCode.初始化_起始大絕招無效> {
  const startUltimateIds = profession?.startUltimateIds ?? []
  if (!startUltimateIds || startUltimateIds.length === 0) {
    return Result.fail(ApplicationErrorCode.初始化_起始大絕招無效)
  }

  const ultimateId = params.startingUltimateId ?? startUltimateIds[0]
  const ultimateTemplate = external.getUltimate(ultimateId)

  if (!ultimateTemplate) {
    return Result.fail(ApplicationErrorCode.初始化_起始大絕招無效)
  }

  const initialAffixData: AffixRecordCreateParams = {
    atCreated: { chapter: 1, stage: 1, difficulty: DifficultyHelper.getDifficultyFactor(1, 1) },
    difficulty: DifficultyHelper.getDifficultyFactor(1, 1),
    sourceUnitId: characterId,
  }

  const ultimateRecord = UltimateRecordFactory.createOne(ultimateId, {
    ...initialAffixData,
  })

  return Result.success(ultimateRecord)
}

function buildRunContext(
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
function buildCharacterContext(
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
function buildStashContext(runId: string): IStashContext {
  return {
    runId,
    version: INITIAL_VERSION,
    capacity: 20,
    items: [],
  }
}
function buildShopContext(runId: string): IShopContext {
  return {
    runId,
    version: INITIAL_VERSION,
    shopConfigId: 'DEFAULT',
    items: [],
  }
}

export interface RunInitializationParams {
  professionId: string
  characterName?: string
  startingRelicIds?: string[]
  startingUltimateId?: string
  seed?: number
}
