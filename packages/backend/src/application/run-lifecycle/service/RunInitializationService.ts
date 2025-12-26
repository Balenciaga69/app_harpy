import { RandomHelper } from '../../../shared/helpers/RandomHelper'
import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'
import { IAppContext } from '../../core-infrastructure/context/interface/IAppContext'
import { ICharacterContext } from '../../core-infrastructure/context/interface/ICharacterContext'
import { ChapterInfo, IRunContext } from '../../core-infrastructure/context/interface/IRunContext'
import { IStashContext } from '../../core-infrastructure/context/interface/IStashContext'
import { IContextBatchRepository } from '../../core-infrastructure/repository/IRepositories'
import {
  IStageNodeGenerationService,
  StageNodeGenerationService,
} from '../../stage-progression/service/StageNodeGenerationService'
import { ItemFactory } from '../../item-generation/factory/ItemFactory'
import { DifficultyHelper } from '../../../shared/helpers/DifficultyHelper'
import { RelicInstance } from '../../../domain/item/itemInstance'
const INITIAL_VERSION = 1
const CREATE_EXPECTED_VERSION = 0
const DEFAULT_CHAPTER_LEVELS: ChapterLevel[] = [1, 2, 3]
export class VersionConflictError extends Error {
  constructor(
    message: string,
    public readonly meta?: any
  ) {
    super(message)
    this.name = 'VersionConflictError'
  }
}
export interface RunInitializationParams {
  professionId: string
  relicIds?: string[]
  characterName?: string
  startingRelicIds?: string[]
  seed?: number
  persist?: boolean
}
export class RunInitializationService {
  constructor(
    private readonly configStore: IAppContext['configStore'],
    private readonly repos?: { batch?: IContextBatchRepository },
    private readonly stageGenerator?: IStageNodeGenerationService
  ) {}
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
  private generateRunId(rng?: RandomHelper): string {
    const randomPart = rng ? Math.floor(rng.next() * 1000) : Math.floor(Math.random() * 1000)
    return `run-${Date.now().toString(36)}-${randomPart}`
  }
}
