import { ItemRollModifier } from '../../../../../../domain/item/roll/ItemRollModifier'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../../../core-infrastructure/context/service/AppContextService'
import { countEquippedTagOccurrences } from './countEquippedTagOccurrences'
import { IItemRollModifierStrategy } from './IItemRollModifierStrategy'
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
    const tagFrequency = countEquippedTagOccurrences(this.configStoreAccessor, this.contextSnapshot)
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
}
