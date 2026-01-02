import { Result } from '../../../../../shared/result/Result'
import { ApplicationErrorCode } from '../../../../../shared/result/ErrorCodes'
import { ItemRarity, ItemTemplate, ItemType } from '../../../../../domain/item/Item'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../../core-infrastructure/context/service/AppContextService'
/**
 * 物品生成限制服務：檢查物品樣板是否符合生成條件
 * 職責：檢查物品是否符合當前進度、職業、事件等限制條件；篩選符合條件的可用樣板
 * 依賴：IConfigStoreAccessor( 讀物品模板 )、IContextSnapshotAccessor( 讀角色與運行狀態 )
 * 邊界：純檢查邏輯，不修改任何狀態
 */
export interface IItemConstraintService {
  /** 檢查物品樣板是否符合當前進度的生成條件 */
  canGenerateItemTemplate(templateId: string): Result<void>
  /** 根據物品類型與稀有度取得符合當前限制條件的可用樣板清單 */
  getAvailableTemplates(itemType: ItemType, rarity: ItemRarity): ItemTemplate[]
}
export class ItemConstraintService implements IItemConstraintService {
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor
  ) {}
  /** 檢查物品樣板是否符合當前進度的生成條件 */
  canGenerateItemTemplate(templateId: string): Result<void> {
    const { characterContext, runContext } = this.contextSnapshot.getAllContexts()
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    const template = itemStore.getRelic(templateId)
    if (!template) {
      return Result.fail(ApplicationErrorCode.物品_物品模板不存在)
    }
    const constraint = itemStore.getItemRollConstraint(templateId)
    if (!constraint) {
      return Result.success(undefined)
    }
    // 檢查章節限制
    if (constraint.chapters && !constraint.chapters.includes(runContext.currentChapter)) {
      return Result.fail(ApplicationErrorCode.物品_章節不允許此物品)
    }
    // 檢查職業限制
    if (constraint.professionIds && !constraint.professionIds.includes(characterContext.professionId)) {
      return Result.fail(ApplicationErrorCode.物品_職業不允許此物品)
    }
    // 檢查事件/敵人限制( 有任一限制則不可生成 )
    if ((constraint.eventIds?.length ?? 0) > 0) {
      return Result.fail(ApplicationErrorCode.物品_物品受事件限制)
    }
    if ((constraint.enemyIds?.length ?? 0) > 0) {
      return Result.fail(ApplicationErrorCode.物品_物品受敵人限制)
    }
    return Result.success(undefined)
  }
  /**
   * 根據物品類型與稀有度取得符合當前限制條件的可用樣板清單
   */
  getAvailableTemplates(itemType: ItemType, rarity: ItemRarity): ItemTemplate[] {
    if (itemType !== 'RELIC') return []
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    return itemStore.getAllRelics().filter((item) => {
      if (item.rarity !== rarity) return false
      const result = this.canGenerateItemTemplate(item.id)
      return result.isSuccess
    })
  }
}
