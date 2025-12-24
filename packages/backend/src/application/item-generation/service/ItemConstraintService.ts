import { ItemRarity, ItemTemplate } from '../../../domain/item/ItemTemplate'
import { ItemRollType } from '../../../domain/item/roll/ItemRollConfig'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'

/* 驗證物品生成是否符合限制的服務 */
export class ItemConstraintService {
  constructor(private appContextService: IAppContextService) {}

  /* 檢查目前是否可以生成物品 */
  canGenerateItems(): boolean {
    // TODO: 未來可能有其他限制條件（如物品池已滿）
    return true
  }

  /* 檢查特定物品樣板是否可生成 */
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

    // 檢查章節限制
    if (constraint.chapters && !constraint.chapters.includes(runContext.currentChapter)) {
      return false
    }

    // 檢查職業限制
    if (constraint.professionIds && !constraint.professionIds.includes(characterContext.professionId)) {
      return false
    }

    // 檢查事件或敵人特定限制
    if (
      (constraint.eventIds && constraint.eventIds.length > 0) ||
      (constraint.enemyIds && constraint.enemyIds.length > 0)
    ) {
      return false
    }

    return true
  }

  /* 取得已排除限制的物品樣板 */
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
