// TODO: 這份代碼由 ai 生成, 需要人工審核, 但暫時先保留
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
import { IContextBatchRepository } from '../../core-infrastructure/repository/IRepositories'
import {
  IStageNodeGenerationService,
  StageNodeGenerationService,
} from './stage-progression/service/StageNodeGenerationService'
//TODO: 添加跟 Shop 相關功能
/**
 * Run 初始化錯誤類型
 * - 職業不存在: 指定的職業不存在
 * - 起始聖物無效: 起始聖物ID無效或不存在
 * - 版本衝突: 並發寫入衝突（資料庫層面）
 */
export type RunInitializationError =
  | ApplicationErrorCode.初始化_職業不存在
  | ApplicationErrorCode.初始化_起始聖物無效
  | ApplicationErrorCode.初始化_版本衝突
// RUN 初始化服務相關常數
const INITIAL_VERSION = 1 // 所有上下文的初始版本
const CREATE_EXPECTED_VERSION = 0 // 建立新上下文時的預期版本
const DEFAULT_CHAPTER_LEVELS: ChapterLevel[] = [1, 2, 3] // 預設章節列表
const DEFAULT_REMAINING_FAIL_RETRIES = 3
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
 * 職責：生成 Run ID、初始化上下文、可選持久化
 */
export class RunInitializationService {
  constructor(
    private readonly configStore: IAppContext['configStore'],
    private readonly repos?: { batch?: IContextBatchRepository },
    private readonly stageGenerator?: IStageNodeGenerationService
  ) {}
  /**
   * 初始化 RUN，上下文可選持久化
   *
   * 流程：
   * 1. 驗證職業存在性
   * 2. 生成 Run ID 與種子
   * 3. 建立所有 Context（Run, Character, Stash）
   * 4. 驗證起始聖物有效性
   * 5. 若 persist=true，批次更新至資料庫
   *
   * 失敗情況：
   * - ProfessionNotFound: 指定的職業不存在
   * - InvalidStartingRelics: 起始聖物ID無效
   * - VersionConflict: 資料庫並發寫入衝突
   */
  async initialize(params: RunInitializationParams): Promise<Result<IAppContext, RunInitializationError>> {
    // 驗證職業存在性
    const profession = this.configStore.professionStore.getProfession(params.professionId)
    if (!profession) {
      return Result.fail(ApplicationErrorCode.初始化_職業不存在)
    }
    // 使用指定或隨機種子初始化隨機數生成器
    const rng = new RandomHelper(params.seed ?? Math.floor(Math.random() * 2 ** 31))
    const runId = this.generateRunId(rng)
    const seed = params.seed ?? Math.floor(rng.next() * 2 ** 31)
    // 建立所有 Context
    const contextsResult = this.buildContexts(runId, params, seed)
    if (contextsResult.isFailure) {
      return Result.fail(contextsResult.error as RunInitializationError)
    }
    const contexts = contextsResult.value!
    // 可選持久化上下文至資料庫
    if (!!params.persist && this.repos && this.repos.batch) {
      const updates = {
        run: { context: contexts.runContext, expectedVersion: CREATE_EXPECTED_VERSION },
        stash: { context: contexts.stashContext, expectedVersion: CREATE_EXPECTED_VERSION },
        character: { context: contexts.characterContext, expectedVersion: CREATE_EXPECTED_VERSION },
        shop: { context: contexts.shopContext, expectedVersion: CREATE_EXPECTED_VERSION },
      }
      const result = await this.repos.batch.updateBatch(updates)
      // 並發衝突檢查
      if (result === null) {
        return Result.fail(ApplicationErrorCode.初始化_版本衝突)
      }
      return Result.success({
        contexts: {
          runContext: result.runContext ?? contexts.runContext,
          stashContext: result.stashContext ?? contexts.stashContext,
          characterContext: result.characterContext ?? contexts.characterContext,
          shopContext: result.shopContext ?? contexts.shopContext,
        },
        configStore: this.configStore,
      })
    }
    return Result.success({
      contexts,
      configStore: this.configStore,
    })
  }
  /**
   * 初始化各個上下文(Run、Stash、Character)
   */
  private buildContexts(
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
    const chaptersLevels: ChapterLevel[] = DEFAULT_CHAPTER_LEVELS
    const chapters: Record<ChapterLevel, ChapterInfo> = {} as Record<ChapterLevel, ChapterInfo>
    for (const ch of chaptersLevels) {
      chapters[ch] = { stageNodes: stageGen.generateStageNodes(seed + ch) }
    }
    const runContext: IRunContext = {
      runId,
      version: INITIAL_VERSION,
      seed,
      currentChapter: 1 as ChapterLevel,
      currentStage: 1,
      encounteredEnemyIds: [],
      chapters: chapters,
      remainingFailRetries: DEFAULT_REMAINING_FAIL_RETRIES,
      rollModifiers: [],
      status: 'IDLE',
      temporaryContext: {},
    }
    const characterId = `${runId}-char`
    // 驗證起始聖物（如有指定）
    const relicRecordsResult = this.createRelicRecord(params.startingRelicIds, characterId)
    if (relicRecordsResult.isFailure) {
      return Result.fail(relicRecordsResult.error as ApplicationErrorCode.初始化_起始聖物無效)
    }
    const characterContext: ICharacterContext = {
      runId,
      version: INITIAL_VERSION,
      id: characterId,
      name: params.characterName ?? 'Player',
      professionId: params.professionId,
      relics: relicRecordsResult.value!,
      gold: 0,
      ultimate: {
        //TODO: 無技能先留空
        // FIXME: 缺一個取 UltimateTemplate 的方法在下方
        pluginAffixRecord: [],
        id: '',
        templateId: '',
        sourceUnitId: '',
        atCreated: { chapter: 1, stage: 1, difficulty: 1 },
      },
      loadCapacity: 2,
      currentLoad: 0,
    }
    const stashContext: IStashContext = {
      runId,
      version: INITIAL_VERSION,
      capacity: 20,
      items: [],
    }
    const shopContext: IShopContext = {
      runId,
      version: INITIAL_VERSION,
      shopConfigId: 'DEFAULT', // 使用預設商店配置
      items: [], // 初始化為空商店
    }
    return Result.success({ runContext, characterContext, stashContext, shopContext })
  }
  /**
   * 初始化起始聖物
   * FIXME: 簡化此方法，避免重複代碼
   */
  private createRelicRecord(
    startingRelicIds: string[] = [],
    characterId: string
  ): Result<RelicRecord[], ApplicationErrorCode.初始化_起始聖物無效> {
    // 若未指定起始聖物，返回空陣列（成功）
    if (!startingRelicIds || startingRelicIds.length === 0) {
      return Result.success([])
    }
    // 從 itemStore 載入聖物樣板
    const { itemStore } = this.configStore
    const relicTemplates = startingRelicIds
      .map((id) => itemStore.getRelic(id))
      .filter((template): template is NonNullable<typeof template> => template !== undefined)
    // 驗證至少有一個聖物有效
    if (relicTemplates.length === 0) {
      return Result.fail(ApplicationErrorCode.初始化_起始聖物無效)
    }
    // 建立詞綴記錄
    const affixIds = relicTemplates.flatMap((template) => template.affixIds ?? [])
    const initialAffixData: AffixRecordCreateParams = {
      atCreated: {
        chapter: 1,
        stage: 1,
        difficulty: DifficultyHelper.getDifficultyFactor(1, 1),
      },
      difficulty: DifficultyHelper.getDifficultyFactor(1, 1),
      sourceUnitId: characterId,
    }
    const affixRecords = AffixRecordFactory.createMany(affixIds, initialAffixData)
    // 建立聖物記錄
    const relicRecords = RelicRecordFactory.createMany(startingRelicIds, {
      ...initialAffixData,
      affixRecords: affixRecords,
    })
    return Result.success(relicRecords)
  }
  /** 生成唯一的 Run ID */
  private generateRunId(rng?: RandomHelper): string {
    const randomPart = rng ? Math.floor(rng.next() * 1000) : Math.floor(Math.random() * 1000)
    return `run-${Date.now().toString(36)}-${randomPart}`
  }
}
