import { ItemRollModifier } from '../../../domain/item/roll/ItemRollModifier'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'
import { IAppContext } from '../../core-infrastructure/context/interface/IAppContext'
import { TagStatistics } from '../../content-generation/helper/TagStatistics'

/**
 * 物品修飾符聚合服務：將高頻標籤與高堆疊物品轉換為骰選修飾符
 * 職責：聚合未過期修飾符、識別高頻標籤、篩選高堆疊聖物
 * 邊界：標籤與堆疊計數閾值為常數 5
 */
export class ItemModifierAggregationService {
  constructor(private appContextService: IAppContextService) {}

  /**
   * 聚合所有適用的骰選修飾符：未過期修飾符 + 高頻標籤 + 高堆疊聖物
   * 副作用：無（純聚合邏輯）
   * 邊界：修飾符 durationStages > 0 表示未過期
   */
  aggregateModifiers(): ItemRollModifier[] {
    const runCtx = this.appContextService.GetContexts().runContext
    const nextRollModifiers = [
      ...runCtx.rollModifiers.filter((mod: ItemRollModifier) => mod.durationStages !== 0),
      ...this.getHighFrequencyTagModifiers(),
      ...this.getHighStackRelicModifiers(),
    ]
    return nextRollModifiers
  }

  /**
   * 統計已裝備物品標籤頻率，將高頻標籤（計數 >= 5）轉換為骰選修飾符
   * 業務規則：高頻標籤增加相同標籤物品的骰選權重 (乘數 0.5)
   * 副作用：無
   */
  private getHighFrequencyTagModifiers(): ItemRollModifier[] {
    const threshold = 5
    const appCtx = {
      contexts: this.appContextService.GetContexts(),
      configStore: this.appContextService.GetConfig(),
    } as IAppContext
    const equippedTags = TagStatistics.countEquippedTags(appCtx).toList()
    const highFreqTags = equippedTags.filter((t) => t.count >= threshold).map((t) => t.tag)
    return highFreqTags.map((tag) => ({
      id: `modifier-tag-${tag}`,
      type: 'TAG',
      tag,
      multiplier: 0.5,
      durationStages: 0,
    }))
  }

  /**
   * 篩選未達堆疊上限但已達閾值（計數 >= 5）的聖物，轉換為骰選修飾符
   * 業務規則：高堆疊聖物增加其再獲得的骰選權重，鼓勵高層級聖物升級
   * 邊界：不包含已達堆疊上限的聖物
   * 副作用：無
   */
  private getHighStackRelicModifiers(): ItemRollModifier[] {
    const contexts = this.appContextService.GetContexts()
    const config = this.appContextService.GetConfig()
    const characterContext = contexts.characterContext
    const itemStore = config.itemStore
    const relics = characterContext.relics
    const threshold = 5
    const highStackRelics = relics.filter((r) => {
      const isHighStack = r.currentStacks >= threshold
      const relicTemplate = itemStore.getRelic(r.templateId)
      const notAtMax = relicTemplate ? r.currentStacks < relicTemplate.stackLimit : false
      return isHighStack && notAtMax
    })
    return highStackRelics.map((r) => ({
      id: `modifier-relic-${r.templateId}`,
      type: 'ID',
      templateId: r.templateId,
      multiplier: 0.2,
      durationStages: 0,
    }))
  }
}
