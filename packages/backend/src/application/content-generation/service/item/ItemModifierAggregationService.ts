import { ItemRollModifier } from '../../../../domain/item/roll/ItemRollModifier'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import {
  HIGH_FREQUENCY_TAG_MULTIPLIER,
  HIGH_FREQUENCY_TAG_THRESHOLD,
  HIGH_STACK_RELIC_MULTIPLIER,
  HIGH_STACK_RELIC_THRESHOLD,
} from '../../constants/ItemGenerationConstants'
import { TagType } from '../../../../shared/models/TagType'
/**
 * 物品修飾符聚合服務：將高頻標籤與高堆疊物品轉換為骰選修飾符
 * 職責：聚合未過期修飾符、識別高頻標籤、篩選高堆疊聖物
 * 依賴：IConfigStoreAccessor（讀物品模板）、IContextSnapshotAccessor（讀角色與運行狀態）
 * 邊界：純聚合邏輯，不修改任何狀態
 */
export interface IItemModifierAggregationService {
  /** 聚合所有適用的骰選修飾符：未過期修飾符 + 高頻標籤 + 高堆疊聖物 */
  aggregateModifiers(): ItemRollModifier[]
}
export class ItemModifierAggregationService implements IItemModifierAggregationService {
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor
  ) {}
  /**
   * 聚合所有適用的骰選修飾符：未過期修飾符 + 高頻標籤 + 高堆疊聖物
   * 副作用：無（純聚合邏輯）
   * 邊界：修飾符 durationStages !== 0 表示未過期
   */
  aggregateModifiers(): ItemRollModifier[] {
    const runCtx = this.contextSnapshot.getRunContext()
    return [
      ...runCtx.rollModifiers.filter((mod) => mod.durationStages !== 0),
      ...this.getHighFrequencyTagModifiers(),
      ...this.getHighStackRelicModifiers(),
    ]
  }
  /**
   * 統計已裝備物品標籤頻率，將高頻標籤轉換為骰選修飾符
   * 業務規則：高頻標籤增加相同標籤物品的骰選權重
   * 副作用：無
   */
  private getHighFrequencyTagModifiers(): ItemRollModifier[] {
    const tagCounts = this.countEquippedTagOccurrences()
    const highFreqTags = Object.entries(tagCounts)
      .filter(([, count]) => (count ?? 0) >= HIGH_FREQUENCY_TAG_THRESHOLD)
      .map(([tag]) => tag as TagType)
    return highFreqTags.map((tag) => ({
      id: `modifier-tag-${tag}`,
      type: 'TAG',
      tag,
      multiplier: HIGH_FREQUENCY_TAG_MULTIPLIER,
      durationStages: 0,
    }))
  }
  /**
   * 統計已裝備聖物的標籤出現次數
   * 邊界：跳過不存在於靜態配置的樣板
   */
  private countEquippedTagOccurrences(): Partial<Record<TagType, number>> {
    const { characterContext } = this.contextSnapshot.getAllContexts()
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    const equippedRelicIds = characterContext.relics.filter(Boolean).map((relic) => relic.templateId)
    const relicTemplates = itemStore.getManyItems(equippedRelicIds)
    const tagCounts: Partial<Record<TagType, number>> = {}
    for (const relic of relicTemplates) {
      for (const tag of relic.tags) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1
      }
    }
    return tagCounts
  }
  /**
   * 篩選未達堆疊上限但已達閾值的聖物，轉換為骰選修飾符
   * 業務規則：高堆疊聖物增加其再獲得的骰選權重，鼓勵高層級聖物升級
   * 邊界：不包含已達堆疊上限的聖物
   * 副作用：無
   */
  private getHighStackRelicModifiers(): ItemRollModifier[] {
    const { characterContext } = this.contextSnapshot.getAllContexts()
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    const highStackRelics = characterContext.relics.filter((r) => {
      const relicTemplate = itemStore.getRelic(r.templateId)
      if (!relicTemplate) return false
      const isHighStack = r.currentStacks >= HIGH_STACK_RELIC_THRESHOLD
      const notAtMax = r.currentStacks < relicTemplate.maxStacks
      return isHighStack && notAtMax
    })
    return highStackRelics.map((r) => ({
      id: `modifier-relic-${r.templateId}`,
      type: 'ID',
      templateId: r.templateId,
      multiplier: HIGH_STACK_RELIC_MULTIPLIER,
      durationStages: 0,
    }))
  }
}
