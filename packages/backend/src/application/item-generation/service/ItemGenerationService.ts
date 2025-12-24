import { ItemRollSourceType } from '../../../domain/item/roll/ItemRollConfig'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'
import { ItemConstraintService } from './ItemConstraintService'
import { ItemRollService } from './ItemRollService'
import { ItemModifierAggregationService } from './ItemModifierAggregationService'
import { ItemInstantiationService } from './ItemInstantiationService'

/* 協調物品生成的完整流程 */
export class ItemGenerationService {
  private constraintService: ItemConstraintService
  private modifierService: ItemModifierAggregationService
  private rollService: ItemRollService
  private instantiationService: ItemInstantiationService

  constructor(appContextService: IAppContextService) {
    this.constraintService = new ItemConstraintService(appContextService)
    this.modifierService = new ItemModifierAggregationService(appContextService)
    this.rollService = new ItemRollService(appContextService, this.constraintService)
    this.instantiationService = new ItemInstantiationService(appContextService)
  }

  /* 生成隨機物品 */
  generateRandomItem(source: ItemRollSourceType) {
    // 步驟 1: 檢驗是否可生成
    if (!this.constraintService.canGenerateItems()) {
      return null
    }

    // 步驟 2: 聚合修飾符
    const modifiers = this.modifierService.aggregateModifiers()

    // 步驟 3: 骰選物品類型、稀有度、樣板
    const { itemTemplateId, itemType } = this.rollService.rollItem(source, modifiers)

    // 步驟 4: 實例化物品
    return this.instantiationService.createItemInstance(itemTemplateId, itemType)
  }

  /* 生成特定樣板的物品 */
  generateItemFromTemplate(templateId: string, itemType: 'RELIC') {
    if (!this.constraintService.canGenerateItemTemplate(templateId)) {
      return null
    }

    return this.instantiationService.createItemInstance(templateId, itemType)
  }
}
