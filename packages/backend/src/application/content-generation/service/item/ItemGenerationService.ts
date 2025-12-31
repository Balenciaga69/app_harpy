import { ItemType, RelicAggregate } from '../../../../domain/item/Item'
import { ItemRollSourceType } from '../../../../domain/item/roll/ItemRollConfig'
import { ApplicationErrorCode } from '../../../../shared/result/ErrorCodes'
import { Result } from '../../../../shared/result/Result'
import { IItemAggregateService } from './ItemAggregateService'
import { IItemConstraintService } from './ItemConstraintService'
import { IItemModifierAggregationService } from './ItemModifierAggregationService'
import { IItemRollService } from './ItemRollService'
/**
 * 物品生成錯誤類型
 */
export interface IItemGenerationService {
  /** 生成隨機物品 */
  generateRandomItem(source: ItemRollSourceType): Result<RelicAggregate>
  /** 根據指定樣板生成物品 */
  generateItemFromTemplate(templateId: string, itemType: ItemType): Result<RelicAggregate>
}
export class ItemGenerationService implements IItemGenerationService {
  constructor(
    private itemAggregateService: IItemAggregateService,
    private constraintService: IItemConstraintService,
    private modifierService: IItemModifierAggregationService,
    private rollService: IItemRollService
  ) {}
  /**
   * 生成隨機物品
   */
  generateRandomItem(source: ItemRollSourceType): Result<RelicAggregate> {
    // 聚合當前適用的骰選修飾符
    const modifiers = this.modifierService.aggregateModifiers()
    const rollResult = this.rollService.rollItem(source, modifiers)
    if (rollResult.isFailure) return Result.fail(rollResult.error!)
    const { itemTemplateId, itemType } = rollResult.value!
    // 根據骰選結果生成物品實例
    return this.generateItemFromTemplate(itemTemplateId, itemType)
  }
  /**
   * 根據指定樣板生成物品
   */
  generateItemFromTemplate(templateId: string, itemType: ItemType): Result<RelicAggregate> {
    // 檢查限制條件
    const constraintResult = this.constraintService.canGenerateItemTemplate(templateId)
    if (constraintResult.isFailure) {
      return Result.fail(constraintResult.error!)
    }
    // 檢查物品類型是否支援
    if (itemType !== 'RELIC') {
      return Result.fail(ApplicationErrorCode.物品_物品類型未支援)
    }
    // 生成物品實例
    const relic = this.itemAggregateService.createRelicByTemplateUsingCurrentContext(templateId)
    return Result.success(relic)
  }
}
