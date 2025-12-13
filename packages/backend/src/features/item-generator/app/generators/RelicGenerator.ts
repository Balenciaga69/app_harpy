/**
 * RelicGenerator
 *
 * 負責生成遺物實例的類別。
 * 根據定義 ID 生成遺物實例。
 */
import { nanoid } from 'nanoid'
// TODO: 依賴外部模組 item，未來需抽象化
import type { IRelicDefinition, IRelicInstance } from '@/features/item/interfaces/definitions'
// TODO: 依賴外部模組 item，未來需抽象化
import { ItemDefinitionRegistry } from '@/features/item/domain/registries/ItemDefinitionRegistry'
/**
 * RelicGenerator 配置
 */
export interface IRelicGeneratorConfig {
  /** 物品註冊表（可選，用於測試） */
  itemRegistry?: ItemDefinitionRegistry
}
/**
 * RelicGenerator 核心類別
 */
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
