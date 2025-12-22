import { ItemRollType } from '../../../../domain/item/roll/ItemRollConfig'
import { DifficultyHelper } from '../../../../shared/helpers/DifficultyHelper'
import { IAppContextService } from '../../../context/service/IAppContextService'
import { ItemInstantiator } from '../../../instantiator/ItemInstantiator'

/** 創建物品實例 */
export const createItemInstance = (service: IAppContextService, templateId: string, itemType: ItemRollType) => {
  if (itemType !== 'RELIC') throw new Error('TODO: 拋領域錯誤,暫時沒有其他類型')
  const { characterContext, runContext, itemStore } = service.getAppContext()
  const { id: ownerId } = characterContext
  const { currentChapter, currentStage } = runContext
  const template = itemStore.getRelic(templateId)
  if (!template) throw new Error('TODO: 拋領域錯誤')
  const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
  return ItemInstantiator.instantiateRelic(template, ownerId, difficulty, currentChapter, currentStage)
}
