import { BaseAttributeValues } from '@/features/attribute/domain/AttributeValues'
import { IRelicInstance } from '@/features/item/interfaces/definitions/IItemInstance'
import { RELIC_MAPPING_LOOKUP } from '../registries/RelicRegistry'
import { AttributeModifier } from '@/features/attribute/interfaces/AttributeModifier'
import type { IRelicProcessor } from '../../interfaces/IRelicProcessor'
export class RelicProcessor implements IRelicProcessor {
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
