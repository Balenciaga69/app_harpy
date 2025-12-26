import { ItemRollModifier } from '../../../domain/item/roll/ItemRollModifier'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'
import { IAppContext } from '../../core-infrastructure/context/interface/IAppContext'
import { TagStatistics } from '../../content-generation/helper/TagStatistics'

/** 聚合高頻標籤與高堆疊物品為修飾符，影響物品骰選權重 */
export class ItemModifierAggregationService {
  constructor(private appContextService: IAppContextService) {}

  /** 聚合未過期修飾符、高頻標籤與高堆疊物品為當前骰選修飾符 */
  aggregateModifiers(): ItemRollModifier[] {
    const runCtx = this.appContextService.GetContexts().runContext
    const nextRollModifiers = [
      ...runCtx.rollModifiers.filter((mod: ItemRollModifier) => mod.durationStages !== 0),
      ...this.getHighFrequencyTagModifiers(),
      ...this.getHighStackRelicModifiers(),
    ]
    return nextRollModifiers
  }

  /** 統計已裝備物品標籤頻率，高頻標籤轉換為修飾符增加其骰選權重 */
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

  /** 篩選未達堆疊上限但已達閾值的聖物，轉換為修飾符增加其骰選概率 */
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
