import { ItemRollModifier } from '../../../../domain/item/roll/ItemRollModifier'
import { IAppContextService } from '../../../context/service/AppContextService'
import { IAppContext } from '../../../context/interface/IAppContext'
import { TagStatistics } from '../../helper/TagStatistics'
/** 取得最新物品骰選修飾符 */
export const getLatestItemRollModifiers = (service: IAppContextService): ItemRollModifier[] => {
  const runCtx = service.GetContexts().runContext
  const nextRollModifiers = [
    ...runCtx.rollModifiers.filter((mod: ItemRollModifier) => mod.durationStages !== 0),
    ...getHighFrequencyTagModifiers(service),
    ...getHighStackRelicModifiers(service),
  ]
  return nextRollModifiers
}
/** 找出已裝備高頻率標籤物品轉換成 tag 修飾符 */
export const getHighFrequencyTagModifiers = (service: IAppContextService): ItemRollModifier[] => {
  const threshold = 5
  const appCtx = { contexts: service.GetContexts(), configStore: service.GetConfig() } as IAppContext
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
/** 找出高堆疊數物品轉換成 id 修飾符 */
export const getHighStackRelicModifiers = (service: IAppContextService): ItemRollModifier[] => {
  const contexts = service.GetContexts()
  const config = service.GetConfig()
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
