import { RelicEntity } from '../../../domain/item/Item'
import { ApplicationErrorCode } from '../../../shared/result/ErrorCodes'
import { Result } from '../../../shared/result/Result'
import { IEquipmentContextHandler } from './EquipmentContextHandler'
/**
 * 裝備服務介面
 */
export interface IEquipmentService {
  equipRelicAndUpdateContexts(relicId: string): Result<void, string>
  unequipRelicAndUpdateContexts(relicId: string): Result<void, string>
}
/**
 * 裝備服務實作
 */
export class EquipmentService implements IEquipmentService {
  constructor(private ctxHandler: IEquipmentContextHandler) {}
  /** 卸下角色聖物至倉庫 */
  public unequipRelicAndUpdateContexts(relicId: string): Result<void, string> {
    // 驗證當前 Run 狀態
    const validateResult = this.ctxHandler.validateRunStatus()
    if (validateResult.isFailure) {
      return Result.fail(validateResult.error ?? '')
    }
    // 取得倉庫與角色的 Domain 物件
    const { stash, character } = this.ctxHandler.loadEquipmentDomainContexts()
    // 從角色身上找到指定的聖物
    const targetRelicAggregate = character.relics.find((r) => r.record.id === relicId)
    if (!targetRelicAggregate) return Result.fail(ApplicationErrorCode.裝備_裝備聖物不存在)
    // 執行卸下聖物的邏輯
    const unequipResult = character.unequipRelic(relicId)
    if (unequipResult.isFailure) return Result.fail(unequipResult.error ?? '')
    // 將卸下的聖物加入倉庫
    const addItemResult = stash.addItem(targetRelicAggregate)
    if (addItemResult.isFailure) return Result.fail(addItemResult.error ?? '')
    const newCharacter = unequipResult.value!
    const newStash = addItemResult.value!
    this.ctxHandler.commitEquipmentTransaction({ character: newCharacter, stash: newStash })
    return Result.success(undefined)
  }
  /** 裝備角色聖物 */
  public equipRelicAndUpdateContexts(relicId: string): Result<void, string> {
    // 驗證當前 Run 狀態
    const validateResult = this.ctxHandler.validateRunStatus()
    if (validateResult.isFailure) return Result.fail(validateResult.error ?? '')
    // 取得倉庫與角色的 Domain 物件
    const { stash, character } = this.ctxHandler.loadEquipmentDomainContexts()
    // 從倉庫取得指定的聖物
    const targetRelicAggregate = stash.getItem(relicId)
    if (!targetRelicAggregate) return Result.fail(ApplicationErrorCode.裝備_裝備聖物不存在)
    // 從倉庫移除該聖物
    const removeItemResult = stash.removeItem(relicId)
    if (removeItemResult.isFailure) return Result.fail(removeItemResult.error ?? '')
    // 執行裝備聖物的邏輯
    const equipResult = character.equipRelic(targetRelicAggregate as RelicEntity)
    if (equipResult.isFailure) return Result.fail(equipResult.error ?? '')
    // 提交變更
    const newStash = removeItemResult.value!
    const newCharacter = equipResult.value!
    this.ctxHandler.commitEquipmentTransaction({ character: newCharacter, stash: newStash })
    return Result.success(undefined)
  }
}
