import type { AttributeModifier } from '@/features/attribute/interfaces/AttributeModifier'
import type { IEquipmentInstance } from '@/features/item/interfaces/definitions/IItemInstance'
export interface IEquipmentProcessor {
  process(equipment: IEquipmentInstance): AttributeModifier[]
  processAll(equipments: readonly IEquipmentInstance[]): AttributeModifier[]
}
