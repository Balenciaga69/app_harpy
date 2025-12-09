/**
 * ItemGenerator
 *
 * 物品生成器（MVP 版本）。
 * 職責：根據難度係數、職業、隨機種子生成裝備與遺物實例。
 * 使用策略模式過濾詞綴，工廠模式組裝實例。
 */
import seedrandom from 'seedrandom'
import { nanoid } from 'nanoid'
import type { IAffixDefinition, IEquipmentDefinition, IRelicDefinition, EquipmentRarity } from '@/domain/item'
import { AffixRoller, ItemDefinitionRegistry, AffixDefinitionRegistry } from '@/domain/item'
import type { IAffixFilter } from './strategies'
import { SlotBasedFilter } from './strategies'
/**
 * ItemGenerator 配置
 */
export interface IItemGeneratorConfig {
  /** 詞綴過濾策略（預設使用 SlotBasedFilter） */
  affixFilter?: IAffixFilter
  /** 物品註冊表（可選，用於測試） */
  itemRegistry?: ItemDefinitionRegistry
  /** 詞綴註冊表（可選，用於測試） */
  affixRegistry?: AffixDefinitionRegistry
}
/**
 * 裝備實例（簡化版，未來可擴充）
 */
export interface IEquipmentInstance {
  readonly id: string
  readonly definitionId: string
  readonly rarity: EquipmentRarity
  readonly affixes: Array<{ affixId: string; value: number }>
}
/**
 * 遺物實例（簡化版）
 */
export interface IRelicInstance {
  readonly id: string
  readonly definitionId: string
  readonly stackCount: number
}
/**
 * ItemGenerator 核心類別
 */
export class ItemGenerator {
  private readonly affixFilter: IAffixFilter
  private readonly itemRegistry: ItemDefinitionRegistry
  private readonly affixRegistry: AffixDefinitionRegistry
  constructor(config: IItemGeneratorConfig = {}) {
    this.affixFilter = config.affixFilter ?? new SlotBasedFilter()
    this.itemRegistry = config.itemRegistry ?? new ItemDefinitionRegistry()
    this.affixRegistry = config.affixRegistry ?? new AffixDefinitionRegistry()
  }
  /**
   * 生成裝備實例
   */
  generateEquipment(definitionId: string, difficulty: number, seed: string): IEquipmentInstance {
    // 1. 取得裝備定義
    const definition = this.itemRegistry.get(definitionId) as IEquipmentDefinition | undefined
    if (!definition) {
      throw new Error(`Equipment definition not found: ${definitionId}`)
    }
    // 2. 初始化隨機數生成器，seedrandom 回傳一個可呼叫的 PRNG
    //    AffixRoller 期望一個有 next(): number 的 IRng，這裡做一個小 adapter
    const prng = seedrandom(seed)
    const rng = { next: () => prng() }
    // 3. 計算詞綴數量（基於難度與稀有度）
    const affixCount = this.calculateAffixCount(definition, difficulty)
    // 4. 篩選可用詞綴池（根據槽位規則）
    const availableAffixes = this.getAvailableAffixes(definition)
    // 5. Roll 詞綴實例
    const affixes = this.rollAffixes(availableAffixes, affixCount, rng)
    // 6. 組裝實例
    return {
      id: nanoid(),
      definitionId: definition.id,
      rarity: definition.rarity,
      affixes,
    }
  }
  /**
   * 生成遺物實例（簡化版，無隨機）
   */
  generateRelic(definitionId: string): IRelicInstance {
    const definition = this.itemRegistry.get(definitionId) as IRelicDefinition | undefined
    if (!definition) {
      throw new Error(`Relic definition not found: ${definitionId}`)
    }
    return {
      id: nanoid(),
      definitionId: definition.id,
      stackCount: 1, // 預設堆疊 1
    }
  }
  /**
   * 計算詞綴數量（基於難度與稀有度）
   */
  private calculateAffixCount(definition: IEquipmentDefinition, difficulty: number): number {
    const { minAffixes, maxAffixes, rarity } = definition
    // 簡單公式：難度越高，越接近 maxAffixes
    let base = minAffixes
    const range = maxAffixes - minAffixes
    if (range > 0) {
      // 根據難度調整
      const difficultyBonus = Math.floor(difficulty / 5) // 每 5 難度 +1 詞綴
      base += Math.min(difficultyBonus, range)
      // 稀有度加成
      if (rarity === 'rare') base += 1
      if (rarity === 'legendary') base += 2
    }
    // 確保在範圍內
    return Math.max(minAffixes, Math.min(base, maxAffixes))
  }
  /**
   * 取得可用詞綴池（根據槽位過濾）
   */
  private getAvailableAffixes(definition: IEquipmentDefinition): IAffixDefinition[] {
    // 1. 從定義取得詞綴池 ID
    const affixIds = definition.affixPoolIds
    // 2. 查詢註冊表取得定義
    const allAffixes = affixIds
      .map((id: string) => this.affixRegistry.get(id))
      .filter((affix: IAffixDefinition | undefined): affix is IAffixDefinition => affix !== undefined)
    // 3. 使用策略過濾
    return this.affixFilter.filter(allAffixes, definition.slot)
  }
  /**
   * Roll 詞綴實例
   */
  private rollAffixes(
    availableAffixes: IAffixDefinition[],
    count: number,
    rng: { next: () => number }
  ): Array<{ affixId: string; value: number }> {
    if (availableAffixes.length === 0) return []
    const result: Array<{ affixId: string; value: number }> = []
    const used = new Set<string>()
    // 使用 AffixRoller 擲骰
    const roller = new AffixRoller(rng, availableAffixes)
    for (let i = 0; i < count; i++) {
      // 過濾已使用的詞綴
      const candidates = availableAffixes.filter((affix) => !used.has(affix.id))
      if (candidates.length === 0) break
      // 使用 roll 方法生成詞綴實例
      const instances = roller.roll(
        candidates.map((c) => c.id),
        1
      )
      if (instances.length === 0) break
      const instance = instances[0]
      // IAffixInstance 使用的欄位為 definitionId / rolledValue
      result.push({ affixId: instance.definitionId, value: instance.rolledValue })
      used.add(instance.definitionId)
    }
    return result
  }
}
