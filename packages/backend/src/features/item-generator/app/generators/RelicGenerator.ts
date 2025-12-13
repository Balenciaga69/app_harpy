import { nanoid } from 'nanoid'
import type { IRelicDefinition, IRelicInstance } from '@/features/item/interfaces/definitions'
import { ItemDefinitionRegistry } from '@/features/item/domain/registries/ItemDefinitionRegistry'
interface IRelicGeneratorConfig {
  /** 物品註冊表（可選，用於測試） */
  itemRegistry?: ItemDefinitionRegistry
}
export class RelicGenerator {
  private readonly itemRegistry: ItemDefinitionRegistry
  constructor(config: IRelicGeneratorConfig = {}) {
    this.itemRegistry = config.itemRegistry ?? new ItemDefinitionRegistry()
  }
  /**
   * 生成遺物實例
   */
  generateRelic(definitionId: string): IRelicInstance {
    const definition = this.itemRegistry.get(definitionId) as IRelicDefinition | undefined
    if (!definition) {
      //TODO: 用 item generator 專屬的 error
      throw new Error(`Relic definition not found: ${definitionId}`)
    }
    return {
      id: nanoid(),
      definitionId: definition.id,
      rarity: definition.rarity,
      stackCount: 1, // 預設堆疊 1
      affixes: [], // 遺物通常沒有隨機詞綴
    }
  }
}
