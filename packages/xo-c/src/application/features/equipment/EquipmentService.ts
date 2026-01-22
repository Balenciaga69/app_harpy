import { RelicEntity } from '../../../domain/item/Item'
import { ApplicationErrorCode } from '../../../shared/result/ErrorCodes'
import { Result } from '../../../shared/result/Result'
import { IEquipmentContextHandler } from './EquipmentContextHandler'
export interface IEquipmentService {
  equipRelicAndUpdateContexts(relicId: string): Result<void, string>
  unequipRelicAndUpdateContexts(relicId: string): Result<void, string>
}
export class EquipmentService implements IEquipmentService {
  constructor(private contextHandler: IEquipmentContextHandler) {}
  public unequipRelicAndUpdateContexts(relicId: string): Result<void, string> {
    const validateResult = this.ctxHandler.validateRunStatus()
    if (validateResult.isFailure) {
      return Result.fail(validateResult.error ?? '')
    }
    const { stash, character } = this.ctxHandler.loadEquipmentDomainContexts()
    const targetRelicEntity = character.relics.find((r) => r.record.id === relicId)
    if (!targetRelicEntity) return Result.fail(ApplicationErrorCode.裝備_裝備聖物不存在)
    const unequipResult = character.unequipRelic(relicId)
    if (unequipResult.isFailure) return Result.fail(unequipResult.error ?? '')
    const addItemResult = stash.addItem(targetRelicEntity)
    if (addItemResult.isFailure) return Result.fail(addItemResult.error ?? '')
    const newCharacter = unequipResult.value!
    const newStash = addItemResult.value!
    this.ctxHandler.commitEquipmentTransaction({ character: newCharacter, stash: newStash })
    return Result.success()
  }
  public equipRelicAndUpdateContexts(relicId: string): Result<void, string> {
    const validateResult = this.ctxHandler.validateRunStatus()
    if (validateResult.isFailure) return Result.fail(validateResult.error ?? '')
    const { stash, character } = this.ctxHandler.loadEquipmentDomainContexts()
    const targetRelicEntity = stash.getItem(relicId)
    if (!targetRelicEntity) return Result.fail(ApplicationErrorCode.裝備_裝備聖物不存在)
    const removeItemResult = stash.removeItem(relicId)
    if (removeItemResult.isFailure) return Result.fail(removeItemResult.error ?? '')
    const equipResult = character.equipRelic(targetRelicEntity as RelicEntity)
    if (equipResult.isFailure) return Result.fail(equipResult.error ?? '')
    const newStash = removeItemResult.value!
    const newCharacter = equipResult.value!
    this.ctxHandler.commitEquipmentTransaction({ character: newCharacter, stash: newStash })
    return Result.success()
  }
}
