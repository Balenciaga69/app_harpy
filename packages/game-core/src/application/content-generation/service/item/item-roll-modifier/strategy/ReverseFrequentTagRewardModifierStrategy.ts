import { ItemRollModifier } from '../../../../../../domain/item/roll/ItemRollModifier'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../../../core-infrastructure/context/service/AppContextService'
import { countEquippedTagOccurrences } from './countEquippedTagOccurrences'
import { IItemRollModifierStrategy } from './IItemRollModifierStrategy'
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
    const tagFrequency = countEquippedTagOccurrences(this.configStoreAccessor, this.contextSnapshot)
    if (tagFrequency.size === 0) return []

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
}
