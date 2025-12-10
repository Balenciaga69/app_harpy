import type { IEquipmentInstance } from '@/domain/item'
import type { AttributeModifier } from '@/logic/attribute-system'
import { AFFIX_MAPPING_LOOKUP } from './affix-registry'
import { createModifierFromAffix } from './affix-attribute-mapping' /**
 * 裝備屬性處理器
 *
 * 將裝備實例的詞綴轉換為屬性修飾器。
 * 此處理器不涉及戰鬥內的動態效果，僅處理靜態屬性增益。
 */
export class EquipmentProcessor {
  /**
   * 從裝備實例提取屬性修飾器
   *
   * @param equipment - 裝備實例
   * @returns 屬性修飾器列表（如詞綴未在註冊表中則跳過）
   */
  process(equipment: IEquipmentInstance): AttributeModifier[] {
    const modifiers: AttributeModifier[] = []
    for (const affix of equipment.affixes) {
      const mapping = AFFIX_MAPPING_LOOKUP.get(affix.definitionId)
      // 若詞綴未在映射表中註冊，則跳過（可能是純效果型詞綴）
      if (!mapping) {
        continue
      }
      const modifier = createModifierFromAffix(affix.definitionId, affix.rolledValue, mapping)
      modifiers.push(modifier)
    }
    return modifiers
  }
  /**
   * 批次處理多個裝備實例
   */
  processAll(equipments: readonly IEquipmentInstance[]): AttributeModifier[] {
    return equipments.flatMap((equipment) => this.process(equipment))
  }
}
