import { ItemRarity } from '../../../../../domain/item/Item'
import { ItemRollModifier } from '../../../../../domain/item/roll/ItemRollModifier'
import { TagType } from '../../../../../shared/models/TagType'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../../core-infrastructure/context/service/AppContextService'
import { IItemRollModifierStrategy } from './IItemRollModifierStrategy'

/**
 * 商店修飾符策略：最常出現TAG策略
 * 業務規則：統計已裝備物品中TAG出現次數最多的，增加其權重
 */
export class MostFrequentTagModifierStrategy implements IItemRollModifierStrategy {
  private readonly multiplier: number

  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor,
    multiplier: number
  ) {
    this.multiplier = multiplier
  }

  aggregateModifiers(): ItemRollModifier[] {
    const tagFrequency = this.countEquippedTagOccurrences()
    if (tagFrequency.size === 0) return []

    // 找出出現最多的TAG
    const mostFrequentTag = Array.from(tagFrequency.entries()).reduce((prev, current) =>
      current[1] > prev[1] ? current : prev
    )[0]

    return [
      {
        type: 'TAG' as const,
        tag: mostFrequentTag,
        multiplier: this.multiplier,
        durationStages: 0,
      },
    ]
  }

  /**
   * 統計已裝備聖物的TAG出現次數
   */
  private countEquippedTagOccurrences(): Map<TagType, number> {
    const { characterContext } = this.contextSnapshot.getAllContexts()
    const { itemStore } = this.configStoreAccessor.getConfigStore()

    const equippedRelicIds = characterContext.relics.filter(Boolean).map((relic) => relic.templateId)
    const relicTemplates = itemStore.getManyItems(equippedRelicIds)

    const tagCounts = new Map<TagType, number>()
    for (const relic of relicTemplates) {
      for (const tag of relic.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
      }
    }

    return tagCounts
  }
}

/**
 * 商店修飾符策略：高堆疊聖物策略
 * 業務規則：指定聖物樣板若堆疊數超過閾值，增加其再獲得的權重
 */
export class HighStackRelicModifierStrategy implements IItemRollModifierStrategy {
  private readonly templateId: string
  private readonly stackThreshold: number
  private readonly multiplier: number

  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor,
    templateId: string,
    stackThreshold: number,
    multiplier: number
  ) {
    this.templateId = templateId
    this.stackThreshold = stackThreshold
    this.multiplier = multiplier
  }

  aggregateModifiers(): ItemRollModifier[] {
    const { characterContext } = this.contextSnapshot.getAllContexts()
    const { itemStore } = this.configStoreAccessor.getConfigStore()

    const relicTemplate = itemStore.getRelic(this.templateId)
    if (!relicTemplate) return []

    // 計算該聖物的堆疊數
    const stackCount = characterContext.relics
      .filter(Boolean)
      .filter((relic) => relic.templateId === this.templateId).length

    if (stackCount >= this.stackThreshold) {
      return [
        {
          type: 'ID' as const,
          templateId: this.templateId,
          multiplier: this.multiplier,
          durationStages: 0,
        },
      ]
    }

    return []
  }
}

/**
 * 獎勵修飾符策略：最常出現TAG策略
 * 業務規則：統計已裝備物品中TAG出現次數最多的，增加其權重
 * 適用獎勵類型：HIGH_AFFINITY、GOLD
 */
export class MostFrequentTagRewardModifierStrategy implements IItemRollModifierStrategy {
  private readonly multiplier: number

  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor,
    multiplier: number
  ) {
    this.multiplier = multiplier
  }

  aggregateModifiers(): ItemRollModifier[] {
    const tagFrequency = this.countEquippedTagOccurrences()
    if (tagFrequency.size === 0) return []

    const mostFrequentTag = Array.from(tagFrequency.entries()).reduce((prev, current) =>
      current[1] > prev[1] ? current : prev
    )[0]

    return [
      {
        type: 'TAG' as const,
        tag: mostFrequentTag,
        multiplier: this.multiplier,
        durationStages: 0,
      },
    ]
  }

  private countEquippedTagOccurrences(): Map<TagType, number> {
    const { characterContext } = this.contextSnapshot.getAllContexts()
    const { itemStore } = this.configStoreAccessor.getConfigStore()

    const equippedRelicIds = characterContext.relics.filter(Boolean).map((relic) => relic.templateId)
    const relicTemplates = itemStore.getManyItems(equippedRelicIds)

    const tagCounts = new Map<TagType, number>()
    for (const relic of relicTemplates) {
      for (const tag of relic.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
      }
    }

    return tagCounts
  }
}

/**
 * 獎勵修飾符策略：稀有度偏好策略
 * 業務規則：調整不同稀有度的生成權重
 * 適用獎勵類型：HIGH_RARITY_RELIC
 */
export class RarityPreferenceRewardModifierStrategy implements IItemRollModifierStrategy {
  private readonly rarityMultipliers: Map<ItemRarity, number>

  constructor(rarityMultipliers: Partial<Record<ItemRarity, number>>) {
    this.rarityMultipliers = new Map(Object.entries(rarityMultipliers) as [ItemRarity, number][])
  }

  aggregateModifiers(): ItemRollModifier[] {
    return Array.from(this.rarityMultipliers.entries()).map(([rarity, multiplier]) => ({
      type: 'RARITY' as const,
      rarity,
      multiplier,
      durationStages: 0,
    }))
  }
}

/**
 * 獎勵修飾符策略：反向高頻TAG策略
 * 業務規則：找出最常出現的TAG前三名，將其權重設為0（不生成）
 * 適用獎勵類型：LOW_AFFINITY
 */
export class ReverseFrequentTagRewardModifierStrategy implements IItemRollModifierStrategy {
  private readonly topN: number = 3

  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor
  ) {}

  aggregateModifiers(): ItemRollModifier[] {
    const tagFrequency = this.countEquippedTagOccurrences()
    if (tagFrequency.size === 0) return []

    // 取出現最頻繁的前N個TAG
    const sortedTags = Array.from(tagFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.topN)
      .map(([tag]) => tag)

    return sortedTags.map((tag) => ({
      type: 'TAG' as const,
      tag,
      multiplier: 0,
      durationStages: 0,
    }))
  }

  private countEquippedTagOccurrences(): Map<TagType, number> {
    const { characterContext } = this.contextSnapshot.getAllContexts()
    const { itemStore } = this.configStoreAccessor.getConfigStore()

    const equippedRelicIds = characterContext.relics.filter(Boolean).map((relic) => relic.templateId)
    const relicTemplates = itemStore.getManyItems(equippedRelicIds)

    const tagCounts = new Map<TagType, number>()
    for (const relic of relicTemplates) {
      for (const tag of relic.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
      }
    }

    return tagCounts
  }
}
