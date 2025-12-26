import { ItemRarity, ItemTemplate } from '../../../domain/item/ItemTemplate'
import { ItemRollType } from '../../../domain/item/roll/ItemRollConfig'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'
/** 驗證物品生成是否符合限制條件（章節、職業、事件等） */
export class ItemConstraintService {
  constructor(private appContextService: IAppContextService) {}
  /** 檢查目前是否可以生成物品 */
  canGenerateItems(): boolean {
    // TODO: 未來可能有其他限制條件（如物品池已滿）
    return true
  }
  /** 檢查特定物品樣板是否符合章節、職業、事件等限制條件 */
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
  /** 取得符合稀有度與限制條件的可用樣板列表 */
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
