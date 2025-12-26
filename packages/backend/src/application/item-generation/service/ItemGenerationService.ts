import { ItemRollSourceType } from '../../../domain/item/roll/ItemRollConfig'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'
import { ItemConstraintService } from './ItemConstraintService'
import { ItemRollService } from './ItemRollService'
import { ItemModifierAggregationService } from './ItemModifierAggregationService'
import { ItemInstantiationService } from './ItemInstantiationService'

/**
 * 物品生成服務：協調物品生成完整流程
 * 流程：約束驗證 → 修飾符聚合 → 權重骰選 → 實例化
 * 職責：協調各個子服務，對外暴露簡潔的生成介面
 */
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

  /**
   * 根據來源與當前修飾符生成隨機物品
   * 邊界：來源必須有效，修飾符不得為空（使用當前聚合修飾符）
   * 副作用：無狀態修改（實例化在記憶體中）
   */
  generateRandomItem(source: ItemRollSourceType) {
    if (!this.constraintService.canGenerateItems()) {
      return null
    }
    const modifiers = this.modifierService.aggregateModifiers()
    const { itemTemplateId, itemType } = this.rollService.rollItem(source, modifiers)
    return this.instantiationService.createItemInstance(itemTemplateId, itemType)
  }

  /**
   * 生成指定樣板的物品，跳過骰選步驟
   * 邊界：樣板必須符合當前進度的限制條件
   * 副作用：無
   */
  generateItemFromTemplate(templateId: string, itemType: 'RELIC') {
    if (!this.constraintService.canGenerateItemTemplate(templateId)) {
      return null
    }
    return this.instantiationService.createItemInstance(templateId, itemType)
  }
}
