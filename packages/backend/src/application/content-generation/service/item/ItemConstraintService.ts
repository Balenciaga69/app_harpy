import { ItemRarity, ItemTemplate } from '../../../../domain/item/Item'
import { ItemRollType } from '../../../../domain/item/roll/ItemRollConfig'
import { IAppContextService } from '../../../core-infrastructure/context/service/AppContextService'

// 物品生成服務：負責隨機物品生成與樣板物品生成
export interface IItemConstraintService {
  canGenerateItemTemplate(templateId: string): boolean
  getAvailableTemplates(itemType: ItemRollType, rarity: ItemRarity): ItemTemplate[]
}

// 物品生成限制服務：檢查物品樣板是否符合當前進度的生成條件
export class ItemConstraintService implements IItemConstraintService {
  constructor(private appContextService: IAppContextService) {}
  // 檢查物品樣板是否符合當前進度的生成條件
  canGenerateItemTemplate(templateId: string): boolean {
    const contexts = this.appContextService.GetContexts()
    const config = this.appContextService.GetConfig()
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
    const config = this.appContextService.GetConfig()
    if (itemType === 'RELIC') {
      return config.itemStore
        .getAllRelics()
        .filter((item: ItemTemplate) => item.rarity === rarity && this.canGenerateItemTemplate(item.id))
    }
    return []
  }
}
