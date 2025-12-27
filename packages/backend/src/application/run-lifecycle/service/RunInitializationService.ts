import { DifficultyHelper } from '../../../shared/helpers/DifficultyHelper'
import { RandomHelper } from '../../../shared/helpers/RandomHelper'
import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'
import { IAppContext } from '../../core-infrastructure/context/interface/IAppContext'
import { ICharacterContext } from '../../core-infrastructure/context/interface/ICharacterContext'
import { ChapterInfo, IRunContext } from '../../core-infrastructure/context/interface/IRunContext'
import { IStashContext } from '../../core-infrastructure/context/interface/IStashContext'
import { IContextBatchRepository } from '../../core-infrastructure/repository/IRepositories'
import { ItemFactory } from '../../item-generation/factory/ItemFactory'
import {
  IStageNodeGenerationService,
  StageNodeGenerationService,
} from '../../stage-progression/service/StageNodeGenerationService'
// RUN 初始化服務相關常數
const INITIAL_VERSION = 1 // 所有上下文的初始版本
const CREATE_EXPECTED_VERSION = 0 // 建立新上下文時的預期版本
const DEFAULT_CHAPTER_LEVELS: ChapterLevel[] = [1, 2, 3] // 預設章節列表
/**
 * 版本衝突異常：當樂觀鎖檢查失敗時拋出
 */
export class VersionConflictError extends Error {
  constructor(
    message: string,
    public readonly meta?: any
  ) {
    super(message)
    this.name = 'VersionConflictError'
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
   * 初始化新 RUN，創建所有必要的上下文
   * 流程：生成 Run ID → 建立所有上下文 → 可選持久化
   * 邊界：
   *   - 職業必須有效
   *   - 初始聖物必須存在
   *   - 如 persist=true，持久化失敗則拋 VersionConflictError
   * 副作用：如 persist=true，修改資料庫；否則無
   */
  async initialize(params: RunInitializationParams): Promise<IAppContext> {
    const rng = new RandomHelper(params.seed ?? Math.floor(Math.random() * 2 ** 31))
    const runId = this.generateRunId(rng)
    const seed = params.seed ?? Math.floor(rng.next() * 2 ** 31)
    const contexts = this.buildContexts(runId, params, seed)
    if (!!params.persist && this.repos && this.repos.batch) {
      const updates = {
        run: { context: contexts.runContext, expectedVersion: CREATE_EXPECTED_VERSION },
        stash: { context: contexts.stashContext, expectedVersion: CREATE_EXPECTED_VERSION },
        character: { context: contexts.characterContext, expectedVersion: CREATE_EXPECTED_VERSION },
      }
      const result = await this.repos.batch.updateBatch(updates)
      if (result === null) throw new VersionConflictError('version conflict while creating contexts', { runId })
      return {
        contexts: {
          runContext: result.runContext ?? contexts.runContext,
          stashContext: result.stashContext ?? contexts.stashContext,
          characterContext: result.characterContext ?? contexts.characterContext,
        },
        configStore: this.configStore,
      }
    }
    return {
      contexts,
      configStore: this.configStore,
    }
  }
  /** 初始化各個上下文(Run、Stash、Character) */
  private buildContexts(runId: string, params: RunInitializationParams, seed: number) {
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
      gold: 0,
      currentChapter: 1 as ChapterLevel,
      currentStage: 1,
      encounteredEnemyIds: [],
      chapters: chapters,
      rollModifiers: [],
    }
    const characterContext: ICharacterContext = {
      runId,
      version: INITIAL_VERSION,
      characterId: `${runId}-char`,
      name: params.characterName ?? 'Player',
      professionId: params.professionId,
      relics: this.createInitialRelics(runId, params.startingRelicIds),
      ultimate: {
        id: '',
        templateId: '',
        sourceUnitId: '',
        atCreated: { chapter: 1 as ChapterLevel, stage: 1, difficulty: 1 },
        pluginIds: [],
      },
      loadCapacity: 0,
    }
    const stashContext: IStashContext = {
      runId,
      version: INITIAL_VERSION,
      capacity: 20,
      items: [],
    }
    return { runContext, characterContext, stashContext }
  }
  /** 初始化起始聖物 */
  private createInitialRelics(runId: string, startingRelicIds?: string[]): RelicInstance[] {
    if (!startingRelicIds || startingRelicIds.length === 0) {
      return []
    }
    return startingRelicIds
      .map((id) => this.configStore.itemStore.getRelic(id))
      .filter((template): template is NonNullable<typeof template> => template !== undefined)
      .map((template) =>
        ItemFactory.createRelic(
          template,
          `${runId}-char`,
          DifficultyHelper.getDifficultyFactor(1, 1),
          1 as ChapterLevel,
          1
        )
      )
  }
  /** 生成唯一的 Run ID */
  private generateRunId(rng?: RandomHelper): string {
    const randomPart = rng ? Math.floor(rng.next() * 1000) : Math.floor(Math.random() * 1000)
    return `run-${Date.now().toString(36)}-${randomPart}`
  }
}
