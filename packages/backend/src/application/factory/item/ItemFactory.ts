import { ItemRollSourceType } from '../../../domain/item/roll/ItemRollConfig'
import { IAppContextService } from '../../context/service/IAppContextService'
import { rollItemType, rollItemRarity, rollItemTemplate } from './helper/itemRollHelpers'
import { getLatestItemRollModifiers } from './helper/itemModifierHelpers'
import { fetchAvailableItemTemplates } from './helper/itemConstraintHelpers'
import { createItemInstance } from './helper/itemCreationHelpers'

/** 生成物品實例 */
const createRandomOne = (service: IAppContextService, generationSource: ItemRollSourceType) => {
  const contexts = service.GetContexts()
  const config = service.GetConfig()
  const runContext = contexts.runContext
  const itemStore = config.itemStore
  // 取得靜態物品掉落限制表
  const staticRollConfig = itemStore.getItemRollConfig(generationSource)
  if (!staticRollConfig) throw new Error('TODO: 拋領域錯誤')
  // 取得動態生成調節修飾符 同時幫忙清理掉已過期的修飾符
  const modifiers = getLatestItemRollModifiers(service)
  const itemType = rollItemType(runContext.seed, staticRollConfig)
  const itemRarity = rollItemRarity(runContext.seed, staticRollConfig, modifiers)
  const availableItemTemplates = fetchAvailableItemTemplates(service, itemType, itemRarity)
  const rolledItemTemplateId = rollItemTemplate(runContext.seed, availableItemTemplates)
  return createItemInstance(service, rolledItemTemplateId, itemType)
}

export const ItemFactory = {
  createRandomOne,
}
