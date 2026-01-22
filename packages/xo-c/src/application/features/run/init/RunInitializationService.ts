import { ProfessionTemplate } from '../../../../domain/profession/Profession'
import { RandomHelper } from '../../../../shared/helpers/RandomHelper'
import { ApplicationErrorCode } from '../../../../shared/result/ErrorCodes'
import { Result } from '../../../../shared/result/Result'
import { IAppContext } from '../../../core-infrastructure/context/interface/IAppContext'
import { ICharacterContext } from '../../../core-infrastructure/context/interface/ICharacterContext'
import { IRunContext } from '../../../core-infrastructure/context/interface/IRunContext'
import { IShopContext } from '../../../core-infrastructure/context/interface/IShopContext'
import { IStashContext } from '../../../core-infrastructure/context/interface/IStashContext'
import { IContextUnitOfWork } from '../../../core-infrastructure/context/service/ContextUnitOfWork'
import { IdGeneratorHelper } from '../../../core-infrastructure/id/idGeneratorHelpers'
import {
  IStageNodeGenerationService,
  StageNodeGenerationService,
} from '../stage-progression/service/StageNodeGenerationService'
import {
  createRelicRecordsForInitialization,
  createUltimateRecordForInitialization,
  resolveStartingRelicIds,
} from './InitializationHelper'
import { buildCharacterContext, buildRunContext, buildShopContext, buildStashContext } from './RunContextBuilder'
import { IRunExternalAdapter } from './RunExternalAdapter'
export class RunInitializationService {
  constructor(
    private readonly external: IRunExternalAdapter,
    private readonly unitOfWork: IContextUnitOfWork,
    private readonly stageNodeService?: IStageNodeGenerationService
  ) {}
  async initialize(parameters: RunInitializationParameters): Promise<Result<IAppContext>> {
    const professionResult = this.validateProfession(parameters.professionId)
    if (professionResult.isFailure) {
      return Result.fail(professionResult.error!)
    }
    const profession = professionResult.value!
    const identifiers = this.generateRunIdentifiers(parameters.seed)
    const contextsResult = this.assembleRunContexts(identifiers.runId, parameters, identifiers.seed, profession)
    if (contextsResult.isFailure) {
      return Result.fail(contextsResult.error!)
    }
    const contexts = contextsResult.value!
    const commitResult = this.commitContexts(contexts)
    if (commitResult.isFailure) {
      return Result.fail(commitResult.error!)
    }
    return Result.success({ contexts, configStore: this.external.getConfigStore() })
  }
  private validateProfession(professionId: string): Result<ProfessionTemplate> {
    const profession = this.external.getProfession(professionId)
    if (!profession) {
      return Result.fail(ApplicationErrorCode.初始化_職業不存在)
    }
    return Result.success(profession)
  }
  private generateRunIdentifiers(seed?: number): { runId: string; seed: number } {
    const rng = new RandomHelper(seed ?? Math.floor(Math.random() * 2 ** 31))
    const runId = IdGeneratorHelper.generateRunId()
    const finalSeed = seed ?? Math.floor(rng.next() * 2 ** 31)
    return { runId, seed: finalSeed }
  }
  private assembleRunContexts(
    runId: string,
    parameters: RunInitializationParameters,
    seed: number,
    profession: ProfessionTemplate
  ): Result<{
    runContext: IRunContext
    characterContext: ICharacterContext
    stashContext: IStashContext
    shopContext: IShopContext
  }> {
    const stageService = this.stageNodeService ?? new StageNodeGenerationService()
    const characterId = `${runId}-char`
    const startingRelicIdsResult = resolveStartingRelicIds(profession.startRelicIds, parameters.startingRelicIds)
    if (startingRelicIdsResult.isFailure) return Result.fail(startingRelicIdsResult.error!)
    const startingRelicIds = startingRelicIdsResult.value!
    const relicRecordsResult = createRelicRecordsForInitialization(startingRelicIds, this.external, characterId)
    if (relicRecordsResult.isFailure) return Result.fail(relicRecordsResult.error!)
    const ultimateRecordResult = createUltimateRecordForInitialization(parameters, profession, this.external, characterId)
    if (ultimateRecordResult.isFailure) return Result.fail(ultimateRecordResult.error!)
    const runContextResult = buildRunContext(runId, seed, stageService)
    if (runContextResult.isFailure) return Result.fail(runContextResult.error!)
    const characterContext = buildCharacterContext(
      runId,
      parameters.professionId,
      parameters.characterName ?? 'Player',
      relicRecordsResult.value!,
      ultimateRecordResult.value!
    )
    const stashContext = buildStashContext(runId)
    const shopContext = buildShopContext(runId)
    return Result.success({ runContext: runContextResult.value!, characterContext, stashContext, shopContext })
  }
  private commitContexts(contexts: {
    runContext: IRunContext
    characterContext: ICharacterContext
    stashContext: IStashContext
    shopContext: IShopContext
  }): Result<void> {
    this.unitOfWork
      .updateRunContext(contexts.runContext)
      .updateCharacterContext(contexts.characterContext)
      .updateStashContext(contexts.stashContext)
      .updateShopContext(contexts.shopContext)
      .commit()
    return Result.success()
  }
}
export interface RunInitializationParameters {
  professionId: string
  characterName?: string
  startingRelicIds?: string[]
  startingUltimateId?: string
  seed?: number
}
