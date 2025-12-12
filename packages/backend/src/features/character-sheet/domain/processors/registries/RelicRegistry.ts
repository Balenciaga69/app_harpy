import { nanoid } from 'nanoid'
/**
 * 遺物屬性映射註冊表
 *
 * 定義每個遺物如何影響角色屬性。
 * 支援基於其他屬性的動態計算。
 */
import { IRelicAttributeMapping } from '../attribute-mappings/RelicAttributeMapping'
export const RELIC_ATTRIBUTE_MAPPINGS: readonly IRelicAttributeMapping[] = [
  // 泰坦之心：每 10 HP +2 護甲（可疊加）
  {
    relicId: 'titans_heart',
    calculator: (baseAttributes, stackCount) => {
      const maxHp = baseAttributes.maxHp ?? 0
      const armorPerStack = Math.floor(maxHp / 10) * 2
      const totalArmor = armorPerStack * stackCount
      return [
        {
          id: `relic-titans_heart-${nanoid(6)}`,
          type: 'armor',
          mode: 'add',
          value: totalArmor,
          source: 'Relic:titans_heart',
        },
      ]
    },
  },
  // 可在此新增更多遺物映射...
] /** 快速查找：從遺物 ID 獲取映射配置 */
export const RELIC_MAPPING_LOOKUP = new Map<string, IRelicAttributeMapping>(
  RELIC_ATTRIBUTE_MAPPINGS.map((mapping) => [mapping.relicId, mapping])
)
