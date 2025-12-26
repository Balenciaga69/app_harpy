import { ItemRarity, ItemTemplate } from '../../../domain/item/ItemTemplate'
import { ItemRollType } from '../../../domain/item/roll/ItemRollConfig'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'

/**
 * 物品約束驗證服務：驗證物品生成是否符合章節、職業、事件等限制條件
 * 職責：生成權限檢查、樣板可用性驗證、符合限制的樣板篩選
 */
export class ItemConstraintService {
  constructor(private appContextService: IAppContextService) {}

  /**
   * 檢查目前是否可以生成物品
   * 邊界條件：未來可能加入物品池滿等限制
   * 副作用：無
   */
  canGenerateItems(): boolean {
    // TODO: 未來可能有其他限制條件（如物品池已滿）
    return true
  }

  /**
   * 檢查特定物品樣板是否符合當前進度的所有限制條件
   * 邊界：檢查章節、職業、事件、敵人等限制
   * 副作用：無
   */
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
