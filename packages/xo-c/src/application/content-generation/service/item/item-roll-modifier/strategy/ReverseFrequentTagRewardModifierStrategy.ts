import { ItemRollModifier } from '../../../../../../domain/item/roll/ItemRollModifier'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../../../core-infrastructure/context/service/AppContextService'
import { countEquippedTagOccurrences } from './countEquippedTagOccurrences'
import { IItemRollModifierStrategy } from './IItemRollModifierStrategy'
export class ReverseFrequentTagRewardModifierStrategy implements IItemRollModifierStrategy {
  private readonly topN: number = 3
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor
  ) {}
  aggregateModifiers(): ItemRollModifier[] {
    const tagFrequency = countEquippedTagOccurrences(this.configStoreAccessor, this.contextSnapshot)
    if (tagFrequency.size === 0) return []
    const sortedTags = [...tagFrequency.entries()]
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
