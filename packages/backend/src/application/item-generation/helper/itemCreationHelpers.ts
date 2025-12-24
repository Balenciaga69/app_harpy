import { ItemRollType } from '../../../domain/item/roll/ItemRollConfig'
import { DifficultyHelper } from '../../../shared/helpers/DifficultyHelper'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'
import { ItemFactory } from '../factory/ItemFactory'

/** 創建物品實例 */
export const createItemInstance = (service: IAppContextService, templateId: string, itemType: ItemRollType) => {
  if (itemType !== 'RELIC') throw new Error('TODO: 拋領域錯誤,暫時沒有其他類型')
  const contexts = service.GetContexts()
  const config = service.GetConfig()
  const characterContext = contexts.characterContext
  const runContext = contexts.runContext
  const itemStore = config.itemStore
  const { characterId } = characterContext
  const { currentChapter, currentStage } = runContext
  const template = itemStore.getRelic(templateId)
  if (!template) throw new Error('TODO: 拋領域錯誤')
  const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
  return ItemFactory.createRelic(template, characterId, difficulty, currentChapter, currentStage)
}
