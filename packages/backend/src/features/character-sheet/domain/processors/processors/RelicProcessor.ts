import type { IRelicInstance } from '@/domain/item'
import type { AttributeModifier } from '@/features/attribute-system'
import type { BaseAttributeValues } from '@/domain/attribute'
import { RELIC_MAPPING_LOOKUP } from '../registries/relic-registry'
/**
 * 遺物屬性處理器
 *
 * 將遺物實例轉換為屬性修飾器。
 * 支援基於角色基礎屬性的動態計算（如 HP 轉護甲）。
 */
export class RelicProcessor {
  /**
   * 從遺物實例提取屬性修飾器
   *
   * @param relic - 遺物實例
   * @param baseAttributes - 角色基礎屬性（用於動態計算）
   * @returns 屬性修飾器列表（如遺物未在註冊表中則跳過）
   */
  process(relic: IRelicInstance, baseAttributes: BaseAttributeValues): AttributeModifier[] {
    const mapping = RELIC_MAPPING_LOOKUP.get(relic.definitionId)
    // 若遺物未在映射表中註冊，則跳過（可能是純效果型遺物）
    if (!mapping) {
      return []
    }
    return mapping.calculator(baseAttributes, relic.stackCount)
  }
  /**
   * 批次處理多個遺物實例
   */
  processAll(relics: readonly IRelicInstance[], baseAttributes: BaseAttributeValues): AttributeModifier[] {
    return relics.flatMap((relic) => this.process(relic, baseAttributes))
  }
}
