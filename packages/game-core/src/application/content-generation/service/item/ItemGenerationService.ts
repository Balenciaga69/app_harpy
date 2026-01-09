import { ItemType, RelicEntity } from '../../../../domain/item/Item'
import { CombatRewardType } from '../../../../domain/post-combat/PostCombat'
import { ApplicationErrorCode } from '../../../../shared/result/ErrorCodes'
import { Result } from '../../../../shared/result/Result'
import { IItemModifierAggregationService } from './item-roll-modifier/ItemModifierAggregationService'
import { IItemEntityService } from './ItemEntityService'
import { IItemConstraintService } from './sub-service/ItemConstraintService'
import { IItemRollService } from './sub-service/ItemRollService'
export interface IItemGenerationService {
  generateRandomItemFromShop(): Result<RelicEntity>
  generateRandomItemFromReward(rewardType: CombatRewardType): Result<RelicEntity>
  generateItemFromTemplate(templateId: string, itemType: ItemType): Result<RelicEntity>
}
export class ItemGenerationService implements IItemGenerationService {
  constructor(
    private itemEntityService: IItemEntityService,
    private constraintService: IItemConstraintService,
    private modifierService: IItemModifierAggregationService,
    private rollService: IItemRollService
  ) {}
  generateRandomItemFromShop(): Result<RelicEntity> {
    const modifiersResult = this.modifierService.aggregateShopModifiers()
    if (modifiersResult.isFailure) return Result.fail(modifiersResult.error!)
    const modifiers = modifiersResult.value!
    const rollResult = this.rollService.rollItem('SHOP_REFRESH', modifiers)
    if (rollResult.isFailure) return Result.fail(rollResult.error!)
    const { itemTemplateId, itemType } = rollResult.value!
    return this.generateItemFromTemplate(itemTemplateId, itemType)
  }
  generateRandomItemFromReward(rewardType: CombatRewardType): Result<RelicEntity> {
    const modifiersResult = this.modifierService.aggregateRewardModifiers(rewardType)
    if (modifiersResult.isFailure) return Result.fail(modifiersResult.error!)
    const modifiers = modifiersResult.value!
    const rollResult = this.rollService.rollItem('POST_COMBAT_REWARD', modifiers)
    if (rollResult.isFailure) return Result.fail(rollResult.error!)
    const { itemTemplateId, itemType } = rollResult.value!
    return this.generateItemFromTemplate(itemTemplateId, itemType)
  }
  generateItemFromTemplate(templateId: string, itemType: ItemType): Result<RelicEntity> {
    const constraintResult = this.constraintService.canGenerateItemTemplate(templateId)
    if (constraintResult.isFailure) {
      return Result.fail(constraintResult.error!)
    }
    if (itemType !== 'RELIC') {
      return Result.fail(ApplicationErrorCode.物品_物品類型未支援)
    }
    const relic = this.itemEntityService.createRelicByTemplateUsingCurrentContext(templateId)
    return Result.success(relic)
  }
}
