/**
 * IAffixFilter
 *
 * 詞綴過濾策略介面，用於策略模式。
 * 定義如何根據不同條件（槽位、職業等）過濾可用詞綴。
 */
// TODO: 依賴外部模組 item，未來需抽象化
import type { IAffixDefinition } from '@/features/item/interfaces/definitions/IAffixDefinition'
// TODO: 依賴外部模組 item，未來需抽象化
import type { EquipmentSlot } from '@/features/item/interfaces/definitions/EquipmentSlot'
export interface IAffixFilter {
  /**
   * 過濾詞綴
   */
  filter(affixes: readonly IAffixDefinition[], slot: EquipmentSlot): IAffixDefinition[]
}
