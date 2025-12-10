/**
 * EquipmentGenerator
 *
 * 負責生成裝備實例的類別。
 * 根據定義 ID、難度係數和隨機種子生成裝備實例。
 */
import seedrandom from 'seedrandom'
import { nanoid } from 'nanoid'
import type { IEquipmentDefinition, IEquipmentInstance, IAffixDefinition, IAffixInstance } from '@/domain/item'
import { AffixRoller, ItemDefinitionRegistry, AffixDefinitionRegistry } from '@/domain/item'
import type { IAffixFilter } from '../strategies'
import { SlotBasedFilter } from '../strategies'
/**
 * EquipmentGenerator 配置
 */
export interface IEquipmentGeneratorConfig {
  /** 詞綴過濾策略（預設使用 SlotBasedFilter） */
  affixFilter?: IAffixFilter
  /** 物品註冊表（可選，用於測試） */
  itemRegistry?: ItemDefinitionRegistry
  /** 詞綴註冊表（可選，用於測試） */
  affixRegistry?: AffixDefinitionRegistry
}
/**
 * EquipmentGenerator 核心類別
 */
export class EquipmentGenerator {
  private readonly affixFilter: IAffixFilter
  private readonly itemRegistry: ItemDefinitionRegistry
  private readonly affixRegistry: AffixDefinitionRegistry
  constructor(config: IEquipmentGeneratorConfig = {}) {
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
      //TODO: 用 item generator 專屬的 error
      throw new Error(`Equipment definition not found: ${definitionId}`)
    }
    // 2. 初始化隨機數生成器
    const prng = seedrandom(seed)
    const rng = { next: () => prng() }
    // 3. 計算詞綴數量
    const affixCount = this.calculateAffixCount(definition, difficulty)
    // 4. 篩選可用詞綴池
    const availableAffixes = this.getAvailableAffixes(definition)
    // 5. Roll 詞綴實例
    const affixes = this.rollAffixes(availableAffixes, affixCount, rng)
    // 6. 組裝實例
    return {
      id: nanoid(),
      definitionId: definition.id,
      slot: definition.slot,
      rarity: definition.rarity,
      affixes,
    }
  }
  /**
   * 計算詞綴數量（基於難度與稀有度）
   */
  private calculateAffixCount(definition: IEquipmentDefinition, difficulty: number): number {
    const { minAffixes, maxAffixes, rarity } = definition
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
      .filter((affix): affix is IAffixDefinition => affix !== undefined)
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
  ): IAffixInstance[] {
    if (availableAffixes.length === 0) return []
    const result: IAffixInstance[] = []
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
      // 正確使用 IAffixInstance 的欄位
      result.push({ definitionId: instance.definitionId, rolledValue: instance.rolledValue })
      used.add(instance.definitionId)
    }
    return result
  }
}
