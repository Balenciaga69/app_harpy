import { ItemRarity } from '../../../domain/item/ItemTemplate'
import { ItemRollType } from '../../../domain/item/roll/ItemRollConfig'
import { ItemRollModifier } from '../../../domain/item/roll/ItemRollModifier'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'
import { rollItemRarity, rollItemTemplate, rollItemType } from '../helper/itemRollHelpers'
import { ItemConstraintService } from './ItemConstraintService'
/* 負責物品骰選邏輯的服務 */
export class ItemRollService {
  constructor(
    private appContextService: IAppContextService,
    private constraintService: ItemConstraintService
  ) {}
  /* 執行完整的物品骰選流程 */
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
