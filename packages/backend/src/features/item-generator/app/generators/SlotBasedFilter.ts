/**
 * SlotBasedFilter
 *
 * 基於槽位的詞綴過濾策略。
 * 規則：
 * - 武器：排除 'defense' tag
 * - 頭盔/盔甲：排除 'attack' tag
 * - 其他槽位：不過濾
 */
import type { IAffixDefinition } from '@/features/item/interfaces/definitions/IAffixDefinition'
import type { EquipmentSlot } from '@/features/item/interfaces/definitions/EquipmentSlot'
import type { IAffixFilter } from '../../interfaces/strategies/IAffixFilter'
export class SlotBasedFilter implements IAffixFilter {
  /**
   * 過濾詞綴
   */
  filter(affixes: readonly IAffixDefinition[], slot: EquipmentSlot): IAffixDefinition[] {
    switch (slot) {
      case 'weapon':
        return affixes.filter((affix) => !affix.tags.includes('defense'))
      case 'helmet':
      case 'armor':
        return affixes.filter((affix) => !affix.tags.includes('attack'))
      default:
        return [...affixes] // 其他槽位不過濾
    }
  }
}
