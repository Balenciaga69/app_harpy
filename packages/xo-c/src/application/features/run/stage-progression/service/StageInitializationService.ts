import { ApplicationErrorCode } from '../../../../../shared/result/ErrorCodes'
import { Result } from '../../../../../shared/result/Result'
import { IEnemyRandomGenerateService } from '../../../../content-generation/service/enemy/EnemyRandomGenerateService'
import { IContextSnapshotAccessor } from '../../../../core-infrastructure/context/service/AppContextService'
import { IContextUnitOfWork } from '../../../../core-infrastructure/context/service/ContextUnitOfWork'
export interface IStageInitializationService {
  initializeStage(stageNumber: number): Result<void, string>
}
export class StageInitializationService implements IStageInitializationService {
  constructor(
    private contextAccessor: IContextSnapshotAccessor,
    private unitOfWork: IContextUnitOfWork,
    private enemyRandomGenerateService: IEnemyRandomGenerateService
  ) {}
  initializeStage(stageNumber: number): Result<void, string> {
    const runContext = this.contextAccessor.getRunContext()
    const { currentChapter, chapters } = runContext
    const chapterInfo = chapters[currentChapter]
    if (!chapterInfo) {
      return Result.fail(ApplicationErrorCode.關卡_章節信息不存在)
    }
    const stageNode = chapterInfo.stageNodes[stageNumber]
    if (!stageNode) {
      return Result.fail(ApplicationErrorCode.關卡_節點不存在)
    }
    if (stageNode === 'NORMAL' || stageNode === 'ELITE' || stageNode === 'BOSS') {
      return this.initializeCombatStage(stageNode, stageNumber)
    } else if (stageNode === 'EVENT') {
      return this.initializeEventStage(stageNumber)
    }
    return Result.fail(ApplicationErrorCode.關卡_未知類型)
  }
  private initializeCombatStage(stageType: string, stageNumber: number): Result<void, string> {
    const enemyResult = this.enemyRandomGenerateService.createRandomOneByTemplateUsingCurrentContext()
    if (enemyResult.isFailure) {
      return Result.fail(enemyResult.error!)
    }
    const enemy = enemyResult.value!
    const preCombatContext = {
      enemy,
      combatDifficulty: stageType as 'NORMAL' | 'ELITE' | 'BOSS',
      stageNumber,
    }
    const runContext = this.contextAccessor.getRunContext()
    const updatedTemporaryContext = {
      ...runContext.temporaryContext,
      preCombat: preCombatContext,
    }
    this.unitOfWork.patchRunContext({
      temporaryContext: updatedTemporaryContext,
    })
    this.unitOfWork.commit()
    return Result.success()
  }
  private initializeEventStage(_stageNumber: number): Result<void, string> {
    // TODO: 實作事件初始化邏輯
    return Result.success()
  }
}
