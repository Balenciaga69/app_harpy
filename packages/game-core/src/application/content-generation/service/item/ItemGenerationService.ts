import { ItemType, RelicEntity } from '../../../../domain/item/Item'
import { CombatRewardType } from '../../../../domain/post-combat/PostCombat'
import { ApplicationErrorCode } from '../../../../shared/result/ErrorCodes'
import { Result } from '../../../../shared/result/Result'
import { IItemModifierAggregationService } from './item-roll-modifier/ItemModifierAggregationService'
import { IItemEntityService } from './ItemEntityService'
import { IItemConstraintService } from './sub-service/ItemConstraintService'
import { IItemRollService } from './sub-service/ItemRollService'
/**
 * 物品生成服務
 * 職責：根據不同來源（商店/獎勵）生成物品
 * 依賴：聚合服務、限制檢查、骰選服務
 */
export interface IItemGenerationService {
  /** 根據商店來源生成隨機物品 */
  generateRandomItemFromShop(): Result<RelicEntity>
  /** 根據獎勵類型生成隨機物品 */
  generateRandomItemFromReward(rewardType: CombatRewardType): Result<RelicEntity>
  /** 根據指定樣板生成物品 */
  generateItemFromTemplate(templateId: string, itemType: ItemType): Result<RelicEntity>
}
export class ItemGenerationService implements IItemGenerationService {
  constructor(
    private itemEntityService: IItemEntityService,
    private constraintService: IItemConstraintService,
    private modifierService: IItemModifierAggregationService,
    private rollService: IItemRollService
  ) {}
  /**
   * 根據商店來源生成隨機物品
   */
  generateRandomItemFromShop(): Result<RelicEntity> {
    // 取得 modifiers
    const modifiersResult = this.modifierService.aggregateShopModifiers()
    if (modifiersResult.isFailure) return Result.fail(modifiersResult.error!)
    const modifiers = modifiersResult.value!
    // 取得 rolled template
    const rollResult = this.rollService.rollItem('SHOP_REFRESH', modifiers)
    if (rollResult.isFailure) return Result.fail(rollResult.error!)
    const { itemTemplateId, itemType } = rollResult.value!
    return this.generateItemFromTemplate(itemTemplateId, itemType)
  }
  /**
   * 根據獎勵類型生成隨機物品
   */
  generateRandomItemFromReward(rewardType: CombatRewardType): Result<RelicEntity> {
    // 取得 modifiers
    const modifiersResult = this.modifierService.aggregateRewardModifiers(rewardType)
    if (modifiersResult.isFailure) return Result.fail(modifiersResult.error!)
    const modifiers = modifiersResult.value!
    // 取得 rolled template
    const rollResult = this.rollService.rollItem('POST_COMBAT_REWARD', modifiers)
    if (rollResult.isFailure) return Result.fail(rollResult.error!)
    const { itemTemplateId, itemType } = rollResult.value!
    return this.generateItemFromTemplate(itemTemplateId, itemType)
  }
  /**
   * 根據指定樣板生成物品
   */
  generateItemFromTemplate(templateId: string, itemType: ItemType): Result<RelicEntity> {
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
    const relic = this.itemEntityService.createRelicByTemplateUsingCurrentContext(templateId)
    return Result.success(relic)
  }
}
