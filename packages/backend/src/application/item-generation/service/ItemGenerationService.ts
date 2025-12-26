import { ItemRollSourceType } from '../../../domain/item/roll/ItemRollConfig'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'
import { ItemConstraintService } from './ItemConstraintService'
import { ItemRollService } from './ItemRollService'
import { ItemModifierAggregationService } from './ItemModifierAggregationService'
import { ItemInstantiationService } from './ItemInstantiationService'

/** 協調物品生成流程：檢驗→聚合修飾符→骰選→實例化 */
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

  /** 根據來源與當前修飾符生成隨機物品 */
  generateRandomItem(source: ItemRollSourceType) {
    if (!this.constraintService.canGenerateItems()) {
      return null
    }
    const modifiers = this.modifierService.aggregateModifiers()
    const { itemTemplateId, itemType } = this.rollService.rollItem(source, modifiers)
    return this.instantiationService.createItemInstance(itemTemplateId, itemType)
  }

  /** 生成指定樣板的物品，跳過骰選步驟 */
  generateItemFromTemplate(templateId: string, itemType: 'RELIC') {
    if (!this.constraintService.canGenerateItemTemplate(templateId)) {
      return null
    }
    return this.instantiationService.createItemInstance(templateId, itemType)
  }
}
