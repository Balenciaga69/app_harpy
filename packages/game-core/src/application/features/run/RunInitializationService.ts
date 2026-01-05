import { RelicRecord } from '../../../domain/item/Item'
import { DifficultyHelper } from '../../../shared/helpers/DifficultyHelper'
import { RandomHelper } from '../../../shared/helpers/RandomHelper'
import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'
import { ApplicationErrorCode } from '../../../shared/result/ErrorCodes'
import { Result } from '../../../shared/result/Result'
import { AffixRecordCreateParams, AffixRecordFactory } from '../../content-generation/factory/AffixFactory'
import { RelicRecordFactory } from '../../content-generation/factory/RelicFactory'
import { IAppContext } from '../../core-infrastructure/context/interface/IAppContext'
import { ICharacterContext } from '../../core-infrastructure/context/interface/ICharacterContext'
import { ChapterInfo, IRunContext } from '../../core-infrastructure/context/interface/IRunContext'
import { IShopContext } from '../../core-infrastructure/context/interface/IShopContext'
import { IStashContext } from '../../core-infrastructure/context/interface/IStashContext'
import { IContextUnitOfWork } from '../../core-infrastructure/context/service/ContextUnitOfWork'
import { IdGeneratorHelper } from '../../core-infrastructure/id/idGeneratorHelpers'
import { IItemStore } from '../../core-infrastructure/static-config/IConfigStores'
import {
  IStageNodeGenerationService,
  StageNodeGenerationService,
} from './stage-progression/service/StageNodeGenerationService'
/**
 * RUN 初始化服務：創建新遊戲進度的完整上下文
 * 職責：協調流程、驗證職業、可選持久化
 *
 * 設計說明：
 * - 使用 UnitOfWork 模式管理事務，支持原子性提交
 * - 分層設計：純函數組裝 → Assembler 協調 → Service 業務流程
 * - 初始化時不生成聚合根，延遲轉換提升性能
 */
export class RunInitializationService {
  constructor(
    private readonly configStore: IAppContext['configStore'],
    private readonly unitOfWork: IContextUnitOfWork,
    private readonly stageGenerator?: IStageNodeGenerationService
  ) {}
  async initialize(params: RunInitializationParams): Promise<Result<IAppContext>> {
    // 驗證職業存在性
    const profession = this.configStore.professionStore.getProfession(params.professionId)
    if (!profession) {
      return Result.fail(ApplicationErrorCode.初始化_職業不存在)
    }
    const rng = new RandomHelper(params.seed ?? Math.floor(Math.random() * 2 ** 31))
    const runId = IdGeneratorHelper.generateRunId()
    const seed = params.seed ?? Math.floor(rng.next() * 2 ** 31)
    // 組裝所有 Context
    const contextsResult = this.buildAllContexts(runId, params, seed)
    if (contextsResult.isFailure) {
      return Result.fail(contextsResult.error!)
    }
    const contexts = contextsResult.value!
    // 可選持久化
    if (params.persist) {
      this.unitOfWork
        .updateRunContext(contexts.runContext)
        .updateCharacterContext(contexts.characterContext)
        .updateStashContext(contexts.stashContext)
        .updateShopContext(contexts.shopContext)
        .commit()
    }
    return Result.success({
      contexts,
      configStore: this.configStore,
    })
  }
  private buildAllContexts(
    runId: string,
    params: RunInitializationParams,
    seed: number
  ): Result<{
    runContext: IRunContext
    characterContext: ICharacterContext
    stashContext: IStashContext
    shopContext: IShopContext
  }> {
    const stageGen = this.stageGenerator ?? new StageNodeGenerationService()
    const characterId = `${runId}-char`
    // 1. 確定起始 relic IDs：優先使用參數提供的，否則使用職業的預設
    const profession = this.configStore.professionStore.getProfession(params.professionId)
    let startingRelicIds: string[]
    if (params.startingRelicIds) {
      // 只允許最多一個起始聖物
      if (params.startingRelicIds.length > 1) {
        return Result.fail(ApplicationErrorCode.初始化_起始聖物只能選一個)
      }
      // 驗證所選起始聖物是否屬於該職業的可選範圍
      const allowed = new Set(profession.startRelicIds)
      for (const id of params.startingRelicIds) {
        if (!allowed.has(id)) {
          return Result.fail(ApplicationErrorCode.初始化_起始聖物無效)
        }
      }
      startingRelicIds = params.startingRelicIds
    } else {
      startingRelicIds = [...profession.startRelicIds]
    }
    // 2. 生成聖物記錄
    const relicRecordsResult = generateInitialRelicRecords(startingRelicIds, this.configStore.itemStore, characterId)
    if (relicRecordsResult.isFailure) {
      return Result.fail(relicRecordsResult.error!)
    }
    // 3. 組裝各個 Context
    const runContext = buildRunContext(runId, seed, stageGen)
    const characterContext = buildCharacterContext(
      runId,
      params.professionId,
      params.characterName ?? 'Player',
      relicRecordsResult.value!
    )
    const stashContext = buildStashContext(runId)
    const shopContext = buildShopContext(runId)
    return Result.success({ runContext, characterContext, stashContext, shopContext })
  }
}
// RUN 初始化服務相關常數
const INITIAL_VERSION = 1 // 所有上下文的初始版本
const DEFAULT_CHAPTER_LEVELS: ChapterLevel[] = [1, 2, 3] // 預設章節列表
const DEFAULT_REMAINING_FAIL_RETRIES = 3
function generateInitialRelicRecords(
  startingRelicIds: string[],
  itemStore: IItemStore,
  characterId: string
): Result<RelicRecord[], ApplicationErrorCode.初始化_起始聖物無效> {
  if (!startingRelicIds || startingRelicIds.length === 0) {
    return Result.success([])
  }
  const relicTemplates = startingRelicIds
    .map((id) => itemStore.getRelic(id))
    .filter((template): template is NonNullable<typeof template> => template !== undefined)
  if (relicTemplates.length === 0) {
    return Result.fail(ApplicationErrorCode.初始化_起始聖物無效)
  }
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
function buildRunContext(runId: string, seed: number, stageGenerator: IStageNodeGenerationService): IRunContext {
  const chapters: Record<ChapterLevel, ChapterInfo> = {} as Record<ChapterLevel, ChapterInfo>
  for (const ch of DEFAULT_CHAPTER_LEVELS) {
    chapters[ch] = { stageNodes: stageGenerator.generateStageNodes(seed + ch) }
  }
  return {
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
  }
}
function buildCharacterContext(
  runId: string,
  professionId: string,
  characterName: string,
  relicRecords: RelicRecord[]
): ICharacterContext {
  const characterId = `${runId}-char`
  return {
    runId,
    version: INITIAL_VERSION,
    id: characterId,
    name: characterName,
    professionId,
    relics: relicRecords,
    gold: 0,
    ultimate: {
      pluginAffixRecord: [],
      id: '',
      templateId: '',
      sourceUnitId: '',
      atCreated: { chapter: 1, stage: 1, difficulty: 1 },
    },
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
/** Run 初始化參數 */
export interface RunInitializationParams {
  professionId: string
  relicIds?: string[]
  characterName?: string
  startingRelicIds?: string[]
  seed?: number
  persist?: boolean
}
