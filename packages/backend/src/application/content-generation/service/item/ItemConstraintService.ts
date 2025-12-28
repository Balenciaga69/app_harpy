import { ItemRarity, ItemTemplate } from '../../../../domain/item/Item'
import { ItemRollType } from '../../../../domain/item/roll/ItemRollConfig'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
/**
 * 物品生成限制服務：檢查物品樣板是否符合生成條件
 * 職責：檢查物品是否符合當前進度、職業、事件等限制條件；篩選符合條件的可用樣板
 * 依賴：IConfigStoreAccessor（讀物品模板）、IContextSnapshotAccessor（讀角色與運行狀態）
 * 邊界：純檢查邏輯，不修改任何狀態
 */
export interface IItemConstraintService {
  /** 檢查物品樣板是否符合當前進度的生成條件 */
  canGenerateItemTemplate(templateId: string): boolean
  /** 根據物品類型與稀有度取得符合當前限制條件的可用樣板清單 */
  getAvailableTemplates(itemType: ItemRollType, rarity: ItemRarity): ItemTemplate[]
}
export class ItemConstraintService implements IItemConstraintService {
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor
  ) {}
  /** 檢查物品樣板是否符合當前進度的生成條件 */
  canGenerateItemTemplate(templateId: string): boolean {
    const { characterContext, runContext } = this.contextSnapshot.getAllContexts()
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    const template = itemStore.getRelic(templateId)
    if (!template) return false
    const constraint = itemStore.getItemRollConstraint(templateId)
    if (!constraint) return true
    // 檢查章節限制
    if (constraint.chapters && !constraint.chapters.includes(runContext.currentChapter)) {
      return false
    }
    // 檢查職業限制
    if (constraint.professionIds && !constraint.professionIds.includes(characterContext.professionId)) {
      return false
    }
    // 檢查事件/敵人限制（有任一限制則不可生成）
    if ((constraint.eventIds?.length ?? 0) > 0 || (constraint.enemyIds?.length ?? 0) > 0) {
      return false
    }
    return true
  }
  /**
   * 根據物品類型與稀有度取得符合當前限制條件的可用樣板清單
   * 邊界：只支援聖物類型，其他類型返回空陣列
   * 副作用：無
   */
  getAvailableTemplates(itemType: ItemRollType, rarity: ItemRarity): ItemTemplate[] {
    if (itemType !== 'RELIC') return []
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    return itemStore.getAllRelics().filter((item) => item.rarity === rarity && this.canGenerateItemTemplate(item.id))
  }
}
