import { Result } from '../../shared/result/Result'
import { RelicAggregate } from '../../domain/item/Item'
import { IContextToDomainConverter } from '../core-infrastructure/context/helper/ContextToDomainConverter'
import { IAppContextService } from '../core-infrastructure/context/service/AppContextService'
import { ContextUnitOfWork } from '../core-infrastructure/context/service/ContextUnitOfWork'
/**
 * 裝備服務錯誤類型
 */
export type EquipmentServiceError =
  | 'EquipmentOperationFailed' // 通用失敗
  | 'RelicNotFound' // 聖物未找到
  | 'Overweight' // 負重超過上限
  | 'SlotOccupied' // 堆疊槽位已滿
  | 'StashFull' // 倉庫滿了
/**
 * 裝備服務介面
 */
export interface IEquipmentService {
  equipRelicAndUpdateContexts(relicId: string): Result<void, EquipmentServiceError>
  unequipRelicAndUpdateContexts(relicId: string): Result<void, EquipmentServiceError>
}
/**
 * 裝備服務實作
 *
 * 職責：
 * - 協調 Domain 層的裝備/卸下邏輯
 * - 使用 UnitOfWork 確保 Context 多欄位同步更新
 * - 轉換 Domain 層的錯誤為應用層的結果
 */
export class EquipmentService implements IEquipmentService {
  constructor(
    private appContextService: IAppContextService,
    private contextToDomainConverter: IContextToDomainConverter
  ) {}
  /**
   * 卸下角色聖物至倉庫
   *
   * 流程：
   * 1. 取得當前 Domain 實體（Character、Stash）
   * 2. 驗證聖物存在 (Character.getRelic)
   * 3. 執行卸下操作 (Character.unequipRelic)
   * 4. 執行加入倉庫操作 (Stash.addItem)
   * 5. 如果任何步驟失敗，返回對應錯誤
   * 6. 如果全部成功，透過 UnitOfWork 一次性更新 Context
   */
  public unequipRelicAndUpdateContexts(relicId: string): Result<void, EquipmentServiceError> {
    // 步驟 1: 取得當前 Domain 實體
    const stash = this.contextToDomainConverter.convertStashContextToDomain()
    const character = this.contextToDomainConverter.convertCharacterContextToDomain()
    // 步驟 2: 驗證聖物存在
    let targetRelicAggregate: RelicAggregate
    try {
      targetRelicAggregate = character.getRelic(relicId)
    } catch {
      return Result.fail('RelicNotFound')
    }
    // 步驟 3: 執行卸下操作
    const unequipResult = character.unequipRelic(relicId)
    if (unequipResult.isFailure) {
      return Result.fail(unequipResult.error as EquipmentServiceError)
    }
    const newCharacter = unequipResult.getOrThrow()
    // 步驟 4: 執行加入倉庫操作
    const addItemResult = stash.addItem(targetRelicAggregate)
    if (addItemResult.isFailure) {
      return Result.fail(addItemResult.error as EquipmentServiceError)
    }
    const newStash = addItemResult.getOrThrow()
    // 步驟 5 & 6: 所有操作成功，透過 UnitOfWork 提交變更
    const unitOfWork = new ContextUnitOfWork(this.appContextService)
    const currentCharacterContext = this.appContextService.getCharacterContext()
    const currentStashContext = this.appContextService.getStashContext()
    unitOfWork
      .updateCharacterContext({
        ...currentCharacterContext,
        ...newCharacter.record,
      })
      .updateStashContext({
        ...currentStashContext,
        items: newStash.listItems().map((i) => i.record),
      })
      .commit()
    return Result.success(undefined)
  }
  /**
   * 從倉庫裝備聖物到角色
   *
   * 流程：
   * 1. 取得當前 Domain 實體（Character、Stash）
   * 2. 驗證聖物在倉庫中存在
   * 3. 執行從倉庫移除操作 (Stash.removeItem)
   * 4. 執行裝備操作 (Character.equipRelic)
   * 5. 如果任何步驟失敗，返回對應錯誤
   * 6. 如果全部成功，透過 UnitOfWork 一次性更新 Context
   */
  public equipRelicAndUpdateContexts(relicId: string): Result<void, EquipmentServiceError> {
    // 步驟 1: 取得當前 Domain 實體
    const stash = this.contextToDomainConverter.convertStashContextToDomain()
    const character = this.contextToDomainConverter.convertCharacterContextToDomain()
    // 步驟 2: 驗證聖物在倉庫中存在
    const targetRelicAggregate = stash.getItem(relicId)
    if (!targetRelicAggregate) {
      return Result.fail('RelicNotFound')
    }
    // 步驟 3: 執行從倉庫移除操作
    const removeItemResult = stash.removeItem(relicId)
    if (removeItemResult.isFailure) {
      return Result.fail(removeItemResult.error as EquipmentServiceError)
    }
    const newStash = removeItemResult.getOrThrow()
    // 步驟 4: 執行裝備操作
    const equipResult = character.equipRelic(targetRelicAggregate as RelicAggregate)
    if (equipResult.isFailure) {
      return Result.fail(equipResult.error as EquipmentServiceError)
    }
    const newCharacter = equipResult.getOrThrow()
    // 步驟 5 & 6: 所有操作成功，透過 UnitOfWork 提交變更
    const unitOfWork = new ContextUnitOfWork(this.appContextService)
    const currentCharacterContext = this.appContextService.getCharacterContext()
    const currentStashContext = this.appContextService.getStashContext()
    unitOfWork
      .updateCharacterContext({
        ...currentCharacterContext,
        ...newCharacter.record,
      })
      .updateStashContext({
        ...currentStashContext,
        items: newStash.listItems().map((i) => i.record),
      })
      .commit()
    return Result.success(undefined)
  }
}
