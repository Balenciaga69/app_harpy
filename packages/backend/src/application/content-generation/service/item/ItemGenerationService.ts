import { Result } from '../../../../shared/result/Result'
import { ApplicationErrorCode } from '../../../../shared/result/ErrorCodes'
import { ItemType, RelicAggregate } from '../../../../domain/item/Item'
import { ItemRollSourceType } from '../../../../domain/item/roll/ItemRollConfig'
import { IItemAggregateService } from './ItemAggregateService'
import { IItemConstraintService, ItemConstraintError } from './ItemConstraintService'
import { IItemModifierAggregationService } from './ItemModifierAggregationService'
import { IItemRollService } from './ItemRollService'
/**
 * 物品生成錯誤類型
 */
export type ItemGenerationError = ItemConstraintError | ApplicationErrorCode.物品_物品類型未支援
export interface IItemGenerationService {
  /** 生成隨機物品 */
  generateRandomItem(source: ItemRollSourceType): Result<RelicAggregate, ItemGenerationError>
  /** 根據指定樣板生成物品 */
  generateItemFromTemplate(templateId: string, itemType: ItemType): Result<RelicAggregate, ItemGenerationError>
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
   *
   * 流程：
   * 1. 聚合當前適用的骰選修飾符
   * 2. 執行物品骰選
   * 3. 根據骰選結果生成物品實例
   */
  generateRandomItem(source: ItemRollSourceType): Result<RelicAggregate, ItemGenerationError> {
    // 聚合當前適用的骰選修飾符
    const modifiers = this.modifierService.aggregateModifiers()
    const { itemTemplateId, itemType } = this.rollService.rollItem(source, modifiers)
    // 根據骰選結果生成物品實例
    return this.generateItemFromTemplate(itemTemplateId, itemType)
  }
  /**
   * 根據指定樣板生成物品
   *
   * 流程：
   * 1. 檢查限制條件
   * 2. 檢查物品類型是否支援
   * 3. 生成物品實例
   */
  generateItemFromTemplate(templateId: string, itemType: ItemType): Result<RelicAggregate, ItemGenerationError> {
    // 步驟 1: 檢查限制條件
    const constraintResult = this.constraintService.canGenerateItemTemplate(templateId)
    if (constraintResult.isFailure) {
      return Result.fail(constraintResult.error as ItemGenerationError)
    }
    // 步驟 2: 檢查物品類型是否支援
    if (itemType !== 'RELIC') {
      return Result.fail(ApplicationErrorCode.物品_物品類型未支援)
    }
    // 步驟 3: 生成物品實例
    const relic = this.itemAggregateService.createRelicByTemplateUsingCurrentContext(templateId)
    return Result.success(relic)
  }
}
