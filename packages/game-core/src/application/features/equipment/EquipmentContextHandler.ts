import { Character } from '../../../domain/character/Character'
import { Stash } from '../../../domain/stash/Stash'
import { Result } from '../../../shared/result/Result'
import { IContextToDomainConverter } from '../../core-infrastructure/context/helper/ContextToDomainConverter'
import { AppContextHolder, IContextSnapshotAccessor } from '../../core-infrastructure/context/service/AppContextService'
import { IContextUnitOfWork } from '../../core-infrastructure/context/service/ContextUnitOfWork'
import { IContextPersistence } from '../../core-infrastructure/context/service/IContextPersistence'
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
    private unitOfWork: IContextUnitOfWork,
    private contextHolder?: AppContextHolder,
    private contextPersistence?: IContextPersistence
  ) {}
  public loadEquipmentDomainContexts() {
    return {
      character: this.contextToDomainConverter.convertCharacterContextToDomain(),
      stash: this.contextToDomainConverter.convertStashContextToDomain(),
    }
  }
  public validateRunStatus(): Result<void, string> {
    const status = this.contextSnapshotAccessor.getRunStatus()
    return RunStatusGuard.requireStatus(status, 'IDLE')
  }
  public commitEquipmentTransaction(updates: { character: Character; stash: Stash }): Result<void> {
    this.unitOfWork.patchCharacterContext({
      ...updates.character.record,
    })
    this.unitOfWork.patchStashContext({
      items: updates.stash.listItems().map((i) => i.record),
    })
    this.unitOfWork.commit()
    
    // Sync cache + DB after commit
    if (this.contextHolder && this.contextPersistence) {
      this.contextPersistence.saveContext(this.contextHolder.get())
    }
    
    return Result.success(undefined)
  }
}
