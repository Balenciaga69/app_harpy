import { ItemRarity, ItemTemplate, ItemType } from '../../../../../domain/item/Item'
import { ApplicationErrorCode } from '../../../../../shared/result/ErrorCodes'
import { Result } from '../../../../../shared/result/Result'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../../core-infrastructure/context/service/AppContextService'
export interface IItemConstraintService {
  canGenerateItemTemplate(templateId: string): Result<void>
  getAvailableTemplates(itemType: ItemType, rarity: ItemRarity): ItemTemplate[]
}
export class ItemConstraintService implements IItemConstraintService {
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor
  ) {}
  canGenerateItemTemplate(templateId: string): Result<void> {
    const { characterContext, runContext } = this.contextSnapshot.getAllContexts()
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    const template = itemStore.getRelic(templateId)
    if (!template) {
      return Result.fail(ApplicationErrorCode.物品_物品模板不存在)
    }
    const hasConstraint = itemStore.hasItemRollConstraint(templateId)
    if (!hasConstraint) {
      return Result.success(undefined)
    }
    const constraint = itemStore.getItemRollConstraint(templateId)
    if (!constraint) {
      return Result.success(undefined)
    }
    if (constraint.chapters && !constraint.chapters.includes(runContext.currentChapter)) {
      return Result.fail(ApplicationErrorCode.物品_章節不允許此物品)
    }
    if (constraint.professionTypes) {
      const profession = this.configStoreAccessor
        .getConfigStore()
        .professionStore.getProfession(characterContext.professionId)
      if (!profession || !constraint.professionTypes.includes(profession.id)) {
        return Result.fail(ApplicationErrorCode.物品_職業不允許此物品)
      }
    }
    if ((constraint.eventIds?.length ?? 0) > 0) {
      return Result.fail(ApplicationErrorCode.物品_物品受事件限制)
    }
    if ((constraint.enemyIds?.length ?? 0) > 0) {
      return Result.fail(ApplicationErrorCode.物品_物品受敵人限制)
    }
    return Result.success(undefined)
  }
  getAvailableTemplates(itemType: ItemType, rarity: ItemRarity): ItemTemplate[] {
    if (itemType !== 'RELIC') return []
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    return itemStore.getAllRelics().filter((item) => {
      if (item.rarity !== rarity) return false
      const result = this.canGenerateItemTemplate(item.id)
      return result.isSuccess
    })
  }
}
