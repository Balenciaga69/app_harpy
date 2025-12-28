import { RelicAggregate } from '../../../../domain/item/Item'
import { ItemRollSourceType, ItemRollType } from '../../../../domain/item/roll/ItemRollConfig'
import { IItemAggregateService } from './ItemAggregateService'
import { IItemConstraintService } from './ItemConstraintService'
import { IItemModifierAggregationService } from './ItemModifierAggregationService'
import { IItemRollService } from './ItemRollService'

export class ItemGenerationService {
  constructor(
    private itemAggregateService: IItemAggregateService,
    private constraintService: IItemConstraintService,
    private modifierService: IItemModifierAggregationService,
    private rollService: IItemRollService
  ) {}
  // 生成隨機物品
  generateRandomItem(source: ItemRollSourceType): RelicAggregate | null {
    // 聚合當前適用的骰選修飾符
    const modifiers = this.modifierService.aggregateModifiers()
    const { itemTemplateId, itemType } = this.rollService.rollItem(source, modifiers)
    // 根據骰選結果生成物品實例
    if (itemType === 'RELIC') return this.generateItemFromTemplate(itemTemplateId, itemType)
    // 其他物品類型尚未實作，返回 null
    return null
  }
  // 根據指定樣板生成物品
  generateItemFromTemplate(templateId: string, itemType: ItemRollType): RelicAggregate | null {
    if (!this.constraintService.canGenerateItemTemplate(templateId)) return null
    if (itemType === 'RELIC') return this.itemAggregateService.createRelicByTemplateUsingCurrentContext(templateId)
    return null
  }
}
