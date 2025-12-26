import { ItemRollModifier } from '../../../domain/item/roll/ItemRollModifier'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'
import { IAppContext } from '../../core-infrastructure/context/interface/IAppContext'
import { TagStatistics } from '../../content-generation/helper/TagStatistics'
/* 聚合並計算物品骰選的修飾符 */
export class ItemModifierAggregationService {
  constructor(private appContextService: IAppContextService) {}
  /* 取得最新的物品骰選修飾符 */
  aggregateModifiers(): ItemRollModifier[] {
    const runCtx = this.appContextService.GetContexts().runContext
    const nextRollModifiers = [
      // 保留未過期的修飾符
      ...runCtx.rollModifiers.filter((mod: ItemRollModifier) => mod.durationStages !== 0),
      // 添加高頻率標籤修飾符
      ...this.getHighFrequencyTagModifiers(),
      // 添加高堆疊物品修飾符
      ...this.getHighStackRelicModifiers(),
    ]
    return nextRollModifiers
  }
  /* 找出已裝備高頻率標籤物品轉換成 tag 修飾符 */
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
  /* 找出高堆疊數物品轉換成 id 修飾符 */
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
