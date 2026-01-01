import { ItemType, RelicAggregate } from '../../../../domain/item/Item'
import { CombatRewardType } from '../../../../domain/post-combat/PostCombat'
import { ApplicationErrorCode } from '../../../../shared/result/ErrorCodes'
import { Result } from '../../../../shared/result/Result'
import { IItemAggregateService } from './ItemAggregateService'
import { IItemConstraintService } from './ItemConstraintService'
import { IItemModifierAggregationService } from './ItemModifierAggregationService'
import { IItemRollService } from './ItemRollService'
/**
 * 物品生成服務
 * 職責：根據不同來源（商店/獎勵）生成物品
 * 依賴：聚合服務、限制檢查、骰選服務
 */
export interface IItemGenerationService {
  /** 根據商店來源生成隨機物品 */
  generateRandomItemFromShop(): Result<RelicAggregate>
  /** 根據獎勵類型生成隨機物品 */
  generateRandomItemFromReward(rewardType: CombatRewardType): Result<RelicAggregate>
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
   * 根據商店來源生成隨機物品
   */
  generateRandomItemFromShop(): Result<RelicAggregate> {
    // 聚合商店特定的修飾符
    const modifiers = this.modifierService.aggregateShopModifiers()
    const rollResult = this.rollService.rollItem('SHOP_REFRESH', modifiers)
    if (rollResult.isFailure) return Result.fail(rollResult.error!)
    const { itemTemplateId, itemType } = rollResult.value!
    return this.generateItemFromTemplate(itemTemplateId, itemType)
  }
  /**
   * 根據獎勵類型生成隨機物品
   */
  generateRandomItemFromReward(rewardType: CombatRewardType): Result<RelicAggregate> {
    // 聚合獎勵特定的修飾符
    const modifiers = this.modifierService.aggregateRewardModifiers(rewardType)
    const rollResult = this.rollService.rollItem('POST_COMBAT_REWARD', modifiers)
    if (rollResult.isFailure) return Result.fail(rollResult.error!)
    const { itemTemplateId, itemType } = rollResult.value!
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
