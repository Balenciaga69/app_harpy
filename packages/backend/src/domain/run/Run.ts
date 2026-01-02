import { ChapterLevel } from '../../shared/models/TemplateWeightInfo'
import { ItemRollModifier } from '../item/roll/ItemRollModifier'
import { Result } from '../../shared/result/Result'
import { DomainErrorCode } from '../../shared/result/ErrorCodes'
import { ChapterInfo, RunStatus } from './RunTypes'
export interface IRunFields {
  readonly seed: number // 運行隨機種子
  readonly currentChapter: ChapterLevel // 目前所在章節
  readonly currentStage: number // 目前所在關卡
  readonly encounteredEnemyIds: string[] // 已遇到的敵人ID列表
  readonly chapters: Record<ChapterLevel, ChapterInfo> // 章節資訊
  readonly rollModifiers: ItemRollModifier[] // 物品生成用的修飾符
  readonly remainingFailRetries: number // 剩餘重試次數
  readonly status: RunStatus // 目前玩家所處的階段狀態
}
export interface IRunBehavior {
  deductRetry(): Result<Run>
  advanceToNextStage(stageNumber: number): Result<Run>
  changeStatus(newStatus: RunStatus): Result<Run>
  addEncounteredEnemy(enemyId: string): Result<Run>
  addRollModifier(modifier: ItemRollModifier): Result<Run>
  endRun(): Result<Run>
}
export class Run implements IRunFields, IRunBehavior {
  private _seed: number
  private _currentChapter: ChapterLevel
  private _currentStage: number
  private _encounteredEnemyIds: string[]
  private _chapters: Record<ChapterLevel, ChapterInfo>
  private _rollModifiers: ItemRollModifier[]
  private _remainingFailRetries: number
  private _status: RunStatus
  constructor(fields: IRunFields) {
    this._seed = fields.seed
    this._currentChapter = fields.currentChapter
    this._currentStage = fields.currentStage
    this._encounteredEnemyIds = [...fields.encounteredEnemyIds]
    this._chapters = { ...fields.chapters }
    this._rollModifiers = [...fields.rollModifiers]
    this._remainingFailRetries = fields.remainingFailRetries
    this._status = fields.status
  }
  // IRunFields implementation
  get seed(): number {
    return this._seed
  }
  get currentChapter(): ChapterLevel {
    return this._currentChapter
  }
  get currentStage(): number {
    return this._currentStage
  }
  get encounteredEnemyIds(): string[] {
    return [...this._encounteredEnemyIds]
  }
  get chapters(): Record<ChapterLevel, ChapterInfo> {
    return { ...this._chapters }
  }
  get rollModifiers(): ItemRollModifier[] {
    return [...this._rollModifiers]
  }
  get remainingFailRetries(): number {
    return this._remainingFailRetries
  }
  get status(): RunStatus {
    return this._status
  }
  // IRunBehavior implementation
  deductRetry(): Result<Run> {
    if (this._remainingFailRetries <= 0) {
      return Result.fail(DomainErrorCode.Run_重試次數不足)
    }
    return Result.success(this.createNewRun({ remainingFailRetries: this._remainingFailRetries - 1 }))
  }
  advanceToNextStage(stageNumber: number): Result<Run> {
    if (stageNumber <= this._currentStage) {
      return Result.fail(DomainErrorCode.Run_無法前進到相同或較早關卡)
    }
    return Result.success(this.createNewRun({ currentStage: stageNumber }))
  }
  changeStatus(newStatus: RunStatus): Result<Run> {
    return Result.success(this.createNewRun({ status: newStatus }))
  }
  addEncounteredEnemy(enemyId: string): Result<Run> {
    if (this._encounteredEnemyIds.includes(enemyId)) {
      return Result.fail(DomainErrorCode.Run_敵人已遭遇過)
    }
    return Result.success(this.createNewRun({ encounteredEnemyIds: [...this._encounteredEnemyIds, enemyId] }))
  }
  addRollModifier(modifier: ItemRollModifier): Result<Run> {
    return Result.success(this.createNewRun({ rollModifiers: [...this._rollModifiers, modifier] }))
  }
  endRun(): Result<Run> {
    return Result.success(this.createNewRun({ status: 'COMPLETED' }))
  }
  private createNewRun(updates: Partial<IRunFields>): Run {
    const newFields: IRunFields = {
      seed: this._seed,
      currentChapter: this._currentChapter,
      currentStage: this._currentStage,
      encounteredEnemyIds: this._encounteredEnemyIds,
      chapters: this._chapters,
      rollModifiers: this._rollModifiers,
      remainingFailRetries: this._remainingFailRetries,
      status: this._status,
      ...updates,
    }
    return new Run(newFields)
  }
}
