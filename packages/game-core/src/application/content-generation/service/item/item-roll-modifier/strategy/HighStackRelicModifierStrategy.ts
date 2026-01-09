import { ItemRollModifier } from '../../../../../../domain/item/roll/ItemRollModifier'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../../../core-infrastructure/context/service/AppContextService'
import { IItemRollModifierStrategy } from './IItemRollModifierStrategy'
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
