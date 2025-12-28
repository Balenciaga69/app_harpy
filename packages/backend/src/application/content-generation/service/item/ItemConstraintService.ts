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
    const contexts = this.contextSnapshot.getAllContexts()
    const config = this.configStoreAccessor.getConfigStore()
    const characterContext = contexts.characterContext
    const runContext = contexts.runContext
    const itemStore = config.itemStore
    const template = itemStore.getRelic(templateId)
    if (!template) return false
    const constraint = itemStore.getItemRollConstraint(templateId)
    if (!constraint) return true
    if (constraint.chapters && !constraint.chapters.includes(runContext.currentChapter)) {
      return false
    }
    if (constraint.professionIds && !constraint.professionIds.includes(characterContext.professionId)) {
      return false
    }
    if (
      (constraint.eventIds && constraint.eventIds.length > 0) ||
      (constraint.enemyIds && constraint.enemyIds.length > 0)
    ) {
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
    const config = this.configStoreAccessor.getConfigStore()
    if (itemType === 'RELIC') {
      return config.itemStore
        .getAllRelics()
        .filter((item: ItemTemplate) => item.rarity === rarity && this.canGenerateItemTemplate(item.id))
    }
    return []
  }
}
