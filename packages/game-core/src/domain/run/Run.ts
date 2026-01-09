import { ChapterLevel } from '../../shared/models/TemplateWeightInfo'
import { DomainErrorCode } from '../../shared/result/ErrorCodes'
import { Result } from '../../shared/result/Result'
import { ItemRollModifier } from '../item/roll/ItemRollModifier'
import { ChapterInfo, RunStatus } from './RunTypes'
export interface IRunFields {
  readonly seed: number

  readonly currentChapter: ChapterLevel

  readonly currentStage: number

  readonly encounteredEnemyIds: string[]

  readonly chapters: Record<ChapterLevel, ChapterInfo>

  readonly rollModifiers: ItemRollModifier[]

  readonly remainingFailRetries: number

  readonly status: RunStatus
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
