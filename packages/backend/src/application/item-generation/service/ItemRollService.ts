import { ItemRarity } from '../../../domain/item/ItemTemplate'
import { ItemRollType } from '../../../domain/item/roll/ItemRollConfig'
import { ItemRollModifier } from '../../../domain/item/roll/ItemRollModifier'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'
import { rollItemRarity, rollItemTemplate, rollItemType } from '../helper/itemRollHelpers'
import { ItemConstraintService } from './ItemConstraintService'

/**
 * 物品骰選服務：執行物品骰選流程
 * 流程：骰選類型 → 骰選稀有度 → 篩選符合條件的樣板 → 骰選樣板
 */
export class ItemRollService {
  constructor(
    private appContextService: IAppContextService,
    private constraintService: ItemConstraintService
  ) {}

  /**
   * 按順序骰選物品類型、稀有度，最後從符合限制的樣板中骰選
   * 邊界：來源配置必須存在，否則拋錯
   * 副作用：無（純骰選邏輯）
   */
  rollItem(
    source: string,
    modifiers: ItemRollModifier[]
  ): { itemTemplateId: string; itemType: ItemRollType; rarity: ItemRarity } {
    const contexts = this.appContextService.GetContexts()
    const config = this.appContextService.GetConfig()
    const runContext = contexts.runContext
    const itemStore = config.itemStore
    const staticRollConfig = itemStore.getItemRollConfig(source)
    if (!staticRollConfig) throw new Error('TODO: 拋領域錯誤')
    const itemType = rollItemType(runContext.seed, staticRollConfig)
    const rarity = rollItemRarity(runContext.seed, staticRollConfig, modifiers)
    const availableTemplates = this.constraintService.getAvailableTemplates(itemType, rarity)
    const itemTemplateId = rollItemTemplate(runContext.seed, availableTemplates)
    return { itemTemplateId, itemType, rarity }
  }
}
