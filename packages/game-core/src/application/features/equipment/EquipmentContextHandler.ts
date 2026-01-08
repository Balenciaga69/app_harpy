import { Character } from '../../../domain/character/Character'
import { Stash } from '../../../domain/stash/Stash'
import { Result } from '../../../shared/result/Result'
import { IContextToDomainConverter } from '../../core-infrastructure/context/helper/ContextToDomainConverter'
import { IContextSnapshotAccessor } from '../../core-infrastructure/context/service/AppContextService'
import { IContextUnitOfWork } from '../../core-infrastructure/context/service/ContextUnitOfWork'
import { RunStatusGuard } from '../../core-infrastructure/run-status/RunStatusGuard'
export interface IEquipmentContextHandler {
  loadEquipmentDomainContexts(): {
    character: Character
    stash: Stash
  }
  validateRunStatus(): Result<void, string>
  commitEquipmentTransaction(updates: { character: Character; stash: Stash }): Result<void>
}
export class EquipmentContextHandler implements IEquipmentContextHandler {
  constructor(
    private contextSnapshotAccessor: IContextSnapshotAccessor,
    private contextToDomainConverter: IContextToDomainConverter,
    private unitOfWork: IContextUnitOfWork
  ) {}
  /** 載入裝備相關的領域上下文 */
  public loadEquipmentDomainContexts() {
    return {
      character: this.contextToDomainConverter.convertCharacterContextToDomain(),
      stash: this.contextToDomainConverter.convertStashContextToDomain(),
    }
  }
  /** 驗證當前 Run 狀態是否為 IDLE */
  public validateRunStatus(): Result<void, string> {
    const status = this.contextSnapshotAccessor.getRunStatus()
    return RunStatusGuard.requireStatus(status, 'IDLE')
  }
  /** 提交裝備交易事務 */
  public commitEquipmentTransaction(updates: { character: Character; stash: Stash }): Result<void> {
    this.unitOfWork.patchCharacterContext({
      ...updates.character.record,
    })
    this.unitOfWork.patchStashContext({
      items: updates.stash.listItems().map((i) => i.record),
    })
    this.unitOfWork.commit()
    return Result.success(undefined)
  }
}
