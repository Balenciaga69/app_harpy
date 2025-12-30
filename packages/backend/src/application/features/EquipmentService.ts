import { Result } from '../../shared/result/Result'
import { RelicAggregate } from '../../domain/item/Item'
import { IContextToDomainConverter } from '../core-infrastructure/context/helper/ContextToDomainConverter'
import { IAppContextService } from '../core-infrastructure/context/service/AppContextService'
import { IContextUnitOfWork } from '../core-infrastructure/context/service/ContextUnitOfWork'
import { CharacterAggregate } from '../../domain/character/Character'
import { Stash } from '../../domain/stash/Stash'
/**
 * 裝備服務介面
 */
export interface IEquipmentService {
  equipRelicAndUpdateContexts(relicId: string): Result<void, string>
  unequipRelicAndUpdateContexts(relicId: string): Result<void, string>
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
    private contextToDomainConverter: IContextToDomainConverter,
    private unitOfWorkFactory: IContextUnitOfWork
  ) {}
  /** 卸下角色聖物至倉庫 */
  public unequipRelicAndUpdateContexts(relicId: string): Result<void, string> {
    // 取得倉庫與角色的 Domain 物件
    const stash = this.contextToDomainConverter.convertStashContextToDomain()
    const character = this.contextToDomainConverter.convertCharacterContextToDomain()
    // 從角色身上找到指定的聖物
    const targetRelicAggregate = character.relics.find((r) => r.record.id === relicId)
    if (!targetRelicAggregate) {
      return Result.fail('RelicNotFound')
    }
    // 執行卸下聖物的邏輯
    const unequipResult = character.unequipRelic(relicId)
    if (unequipResult.isFailure) {
      return Result.fail(unequipResult.error as string)
    }
    // 將卸下的聖物加入倉庫
    const addItemResult = stash.addItem(targetRelicAggregate)
    if (addItemResult.isFailure) {
      return Result.fail(addItemResult.error as string)
    }
    const newCharacter = unequipResult.getOrThrow()
    const newStash = addItemResult.getOrThrow()
    this.commitUnitOfWork(newCharacter, newStash)
    return Result.success(undefined)
  }
  /** 裝備角色聖物 */
  public equipRelicAndUpdateContexts(relicId: string): Result<void, string> {
    // 取得倉庫與角色的 Domain 物件
    const stash = this.contextToDomainConverter.convertStashContextToDomain()
    const character = this.contextToDomainConverter.convertCharacterContextToDomain()
    // 從倉庫取得指定的聖物
    const targetRelicAggregate = stash.getItem(relicId)
    if (!targetRelicAggregate) {
      return Result.fail('RelicNotFound')
    }
    // 從倉庫移除該聖物
    const removeItemResult = stash.removeItem(relicId)
    if (removeItemResult.isFailure) {
      return Result.fail(removeItemResult.error as string)
    }
    // 執行裝備聖物的邏輯
    const equipResult = character.equipRelic(targetRelicAggregate as RelicAggregate)
    if (equipResult.isFailure) {
      return Result.fail(equipResult.error as string)
    }
    // 提交變更
    const newStash = removeItemResult.getOrThrow()
    const newCharacter = equipResult.getOrThrow()
    this.commitUnitOfWork(newCharacter, newStash)
    return Result.success(undefined)
  }
  /** 使用 UnitOfWork 同步提交角色與倉庫的 Context 變更 */
  private commitUnitOfWork(newCharacter: CharacterAggregate, newStash: Stash): void {
    // 取得目前的 Context 狀態
    const currentCharacterContext = this.appContextService.getCharacterContext()
    const currentStashContext = this.appContextService.getStashContext()
    // 使用 UnitOfWork 同步更新角色與倉庫 Context
    this.unitOfWorkFactory
      .updateCharacterContext({
        ...currentCharacterContext,
        ...newCharacter.record,
      })
      .updateStashContext({
        ...currentStashContext,
        items: newStash.listItems().map((i) => i.record),
      })
      .commit()
  }
}
