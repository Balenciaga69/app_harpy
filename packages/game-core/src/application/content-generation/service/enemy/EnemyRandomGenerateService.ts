import { EnemyEntity, EnemyRole, EnemySpawnInfo } from '../../../../domain/entity/Enemy'
import { WeightRoller } from '../../../../shared/helpers/WeightRoller'
import { ApplicationErrorCode } from '../../../../shared/result/ErrorCodes'
import { Result } from '../../../../shared/result/Result'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { IEnemyEntityService } from './EnemyEntityService'
/**
 * 敵人生成錯誤類型
 * - 無可用敵人: 關卡無可用敵人（已全部遭遇過）
 * - 關卡資訊無效: 關卡資訊不完整或無效
 */
export interface IEnemyRandomGenerateService {
  createRandomOneByTemplateUsingCurrentContext(): Result<EnemyEntity>
}
/**
 * EnemyRandomGenerateService：負責真正的隨機選擇與封裝流程( createRandomOne )
 * - 僅負責選取哪個樣板、如何決策，組裝則委派給 IEnemyEntityService
 */
export class EnemyRandomGenerateService implements IEnemyRandomGenerateService {
  constructor(
    private readonly enemyEntityService: IEnemyEntityService,
    private readonly configStoreAccessor: IConfigStoreAccessor,
    private readonly contextSnapshotAccessor: IContextSnapshotAccessor
  ) {}
  /**
   * 隨機選擇並創建一個 EnemyEntity
   */
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
  /**
   * 取得當前關卡可用的敵人生成資訊
   */
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
