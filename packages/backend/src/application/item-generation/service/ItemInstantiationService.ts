import { ItemRollType } from '../../../domain/item/roll/ItemRollConfig'
import { DifficultyHelper } from '../../../shared/helpers/DifficultyHelper'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'
import { ItemFactory } from '../factory/ItemFactory'

/**
 * 物品實例化服務：根據當前進度背景創建物品實例
 * 職責：難度計算、樣板驗證、實例化工廠調用
 */
export class ItemInstantiationService {
  constructor(private appContextService: IAppContextService) {}

  /**
   * 根據樣板與類型創建物品實例，自動計算難度因子
   * 邊界：
   *   - 目前只支援聖物類型，其他類型拋錯
   *   - 樣板必須存在，否則拋錯
   * 副作用：無（實例化在記憶體中）
   */
  createItemInstance(templateId: string, itemType: ItemRollType) {
    const contexts = this.appContextService.GetContexts()
    const config = this.appContextService.GetConfig()
    const characterContext = contexts.characterContext
    const runContext = contexts.runContext
    const itemStore = config.itemStore
    const { characterId } = characterContext
    const { currentChapter, currentStage } = runContext
    if (itemType !== 'RELIC') throw new Error('TODO: 拋領域錯誤,暫時沒有其他類型')
    const template = itemStore.getRelic(templateId)
    if (!template) throw new Error('TODO: 拋領域錯誤')
    const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
    return ItemFactory.createRelic(template, characterId, difficulty, currentChapter, currentStage)
  }
}
