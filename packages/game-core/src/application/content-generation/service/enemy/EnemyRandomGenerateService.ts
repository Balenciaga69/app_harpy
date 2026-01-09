import { EnemyEntity, EnemyRole, EnemySpawnInfo } from '../../../../domain/entity/Enemy'
import { WeightRoller } from '../../../../shared/helpers/WeightRoller'
import { ApplicationErrorCode } from '../../../../shared/result/ErrorCodes'
import { Result } from '../../../../shared/result/Result'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { IEnemyEntityService } from './EnemyEntityService'
export interface IEnemyRandomGenerateService {
  createRandomOneByTemplateUsingCurrentContext(): Result<EnemyEntity>
}
export class EnemyRandomGenerateService implements IEnemyRandomGenerateService {
  constructor(
    private readonly enemyEntityService: IEnemyEntityService,
    private readonly configStoreAccessor: IConfigStoreAccessor,
    private readonly contextSnapshotAccessor: IContextSnapshotAccessor
  ) {}
  createRandomOneByTemplateUsingCurrentContext(): Result<EnemyEntity> {
    const runContext = this.contextSnapshotAccessor.getRunContext()
    const { currentChapter, currentStage, chapters, seed } = runContext
    const availableInfosResult = this.getAvailableEnemySpawnInfos()
    if (availableInfosResult.isFailure) return Result.fail(availableInfosResult.error!)
    const availableInfos = availableInfosResult.value!
    const forRollInfos = availableInfos.map((info) => ({
      id: info.templateId,
      weight: info.weight,
    }))
    const rolledEnemyIdResult = WeightRoller.roll(seed, forRollInfos)
    if (rolledEnemyIdResult.isFailure) return Result.fail(rolledEnemyIdResult.error!)
    const rolledEnemyTemplateId = rolledEnemyIdResult.value!
    const stageEnemyRole = chapters[currentChapter].stageNodes[currentStage]
    if (!stageEnemyRole) return Result.fail(ApplicationErrorCode.敵人_關卡資訊無效)
    const enemy = this.enemyEntityService.createOneByTemplateUsingCurrentContext(
      rolledEnemyTemplateId,
      stageEnemyRole as EnemyRole
    )
    return Result.success(enemy)
  }
  private getAvailableEnemySpawnInfos(): Result<EnemySpawnInfo[], ApplicationErrorCode.敵人_無可用敵人> {
    const { enemyStore } = this.configStoreAccessor.getConfigStore()
    const { currentChapter, encounteredEnemyIds } = this.contextSnapshotAccessor.getRunContext()
    const availableInfos = enemyStore
      .getEnemySpawnInfosByChapter(currentChapter)
      .filter((info) => !encounteredEnemyIds.includes(info.templateId))
    if (availableInfos.length === 0) return Result.fail(ApplicationErrorCode.敵人_無可用敵人)
    return Result.success(availableInfos)
  }
}
