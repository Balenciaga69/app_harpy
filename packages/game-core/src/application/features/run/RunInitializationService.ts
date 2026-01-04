import { RelicRecord } from '../../../domain/item/Item'
import { DifficultyHelper } from '../../../shared/helpers/DifficultyHelper'
import { RandomHelper } from '../../../shared/helpers/RandomHelper'
import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'
import { Result } from '../../../shared/result/Result'
import { ApplicationErrorCode } from '../../../shared/result/ErrorCodes'
import { AffixRecordCreateParams, AffixRecordFactory } from '../../content-generation/factory/AffixFactory'
import { RelicRecordFactory } from '../../content-generation/factory/RelicFactory'
import { IAppContext } from '../../core-infrastructure/context/interface/IAppContext'
import { ICharacterContext } from '../../core-infrastructure/context/interface/ICharacterContext'
import { ChapterInfo, IRunContext } from '../../core-infrastructure/context/interface/IRunContext'
import { IShopContext } from '../../core-infrastructure/context/interface/IShopContext'
import { IStashContext } from '../../core-infrastructure/context/interface/IStashContext'
import { IContextUnitOfWork } from '../../core-infrastructure/context/service/ContextUnitOfWork'
import { IdGeneratorHelper } from '../../core-infrastructure/id'
import {
  IStageNodeGenerationService,
  StageNodeGenerationService,
} from './stage-progression/service/StageNodeGenerationService'
import { IItemStore } from '../../core-infrastructure/static-config/IConfigStores'
// RUN 初始化服務相關常數
const INITIAL_VERSION = 1 // 所有上下文的初始版本
const DEFAULT_CHAPTER_LEVELS: ChapterLevel[] = [1, 2, 3] // 預設章節列表
const DEFAULT_REMAINING_FAIL_RETRIES = 3
// ========================================
// 純函數區：可獨立測試的組裝邏輯
// ========================================
/**
 * 生成初始聖物記錄（純函數）
 * 職責：驗證聖物 Template 並組裝 RelicRecord
 */
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
/**
 * 組裝 RunContext（純函數）
 * 職責：生成章節與關卡節點結構
 */
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
/**
 * 組裝 CharacterContext（純函數）
 * 職責：組裝角色初始狀態
 */
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
/**
 * 組裝 StashContext（純函數）
 */
function buildStashContext(runId: string): IStashContext {
  return {
    runId,
    version: INITIAL_VERSION,
    capacity: 20,
    items: [],
  }
}
/**
 * 組裝 ShopContext（純函數）
 */
function buildShopContext(runId: string): IShopContext {
  return {
    runId,
    version: INITIAL_VERSION,
    shopConfigId: 'DEFAULT',
    items: [],
  }
}
// ========================================
// RunInitializationService 類別
// ========================================
/** Run 初始化參數 */
export interface RunInitializationParams {
  professionId: string
  relicIds?: string[]
  characterName?: string
  startingRelicIds?: string[]
  seed?: number
  persist?: boolean
}
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
  /**
   * 組裝所有 Context（協調函數）
   * 職責：調用純函數並處理依賴
   */
  private buildAllContexts(
    runId: string,
    params: RunInitializationParams,
    seed: number
  ): Result<
    {
      runContext: IRunContext
      characterContext: ICharacterContext
      stashContext: IStashContext
      shopContext: IShopContext
    },
    ApplicationErrorCode.初始化_起始聖物無效
  > {
    const stageGen = this.stageGenerator ?? new StageNodeGenerationService()
    const characterId = `${runId}-char`
    // 1. 生成聖物記錄
    const relicRecordsResult = generateInitialRelicRecords(
      params.startingRelicIds ?? [],
      this.configStore.itemStore,
      characterId
    )
    if (relicRecordsResult.isFailure) {
      return Result.fail(relicRecordsResult.error!)
    }
    // 2. 組裝各個 Context
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
