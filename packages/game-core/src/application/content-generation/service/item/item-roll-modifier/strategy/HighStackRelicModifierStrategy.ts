import { ItemRollModifier } from '../../../../../../domain/item/roll/ItemRollModifier'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../../../core-infrastructure/context/service/AppContextService'
import { IItemRollModifierStrategy } from './IItemRollModifierStrategy'
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
