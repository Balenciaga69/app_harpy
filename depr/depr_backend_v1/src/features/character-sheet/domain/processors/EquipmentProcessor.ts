import { AttributeModifier } from '@/features/attribute/interfaces/AttributeModifier'
import { IEquipmentInstance } from '@/features/item/interfaces/definitions/IItemInstance'
import { createModifierFromAffix } from '../../interfaces/IAffixAttributeMapping'
import { AFFIX_MAPPING_LOOKUP } from '../registries/AffixRegistry'
import type { IEquipmentProcessor } from '../../interfaces/IEquipmentProcessor'
export class EquipmentProcessor implements IEquipmentProcessor {
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
  processAll(equipments: readonly IEquipmentInstance[]): AttributeModifier[] {
    return equipments.flatMap((equipment) => this.process(equipment))
  }
}
