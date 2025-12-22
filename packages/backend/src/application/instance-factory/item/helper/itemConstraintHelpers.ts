import { ItemRarity, ItemTemplate } from '../../../../domain/item/ItemTemplate'
import { ItemRollType } from '../../../../domain/item/roll/ItemRollConfig'
import { IAppContextService } from '../../../context/service/IAppContextService'

/** 取得已排除限制的物品樣板 */
export const fetchAvailableItemTemplates = (
  service: IAppContextService,
  itemType: ItemRollType,
  itemRarity: ItemRarity
): ItemTemplate[] => {
  if (itemType === 'RELIC') {
    return service
      .getAppContext()
      .itemStore.getAllRelics()
      .filter((item) => item.rarity === itemRarity && isItemGenerationAllowed(service, item))
  }
  return []
}

/** 檢查物品是否允許生成 */
export const isItemGenerationAllowed = (service: IAppContextService, itemTemplate: ItemTemplate): boolean => {
  const { characterContext, runContext, itemStore } = service.getAppContext()
  const constraint = itemStore.getItemRollConstraint(itemTemplate.id)
  if (!constraint) return true
  if (constraint.chapters && !constraint.chapters.includes(runContext.currentChapter)) return false
  if (constraint.professionIds && !constraint.professionIds.includes(characterContext.professionId)) return false
  if (
    (!!constraint.eventIds && constraint.eventIds.length > 0) ||
    (!!constraint.enemyIds && constraint.enemyIds.length > 0)
  )
    return false
  return true
}
