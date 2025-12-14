import type { AttributeModifier } from '@/features/attribute/interfaces/AttributeModifier'
import type { BaseAttributeValues } from '@/features/attribute/interfaces/BaseAttributeValues'
import type { IRelicInstance } from '@/features/item/interfaces/definitions/IItemInstance'
export interface IRelicProcessor {
  process(relic: IRelicInstance, baseAttributes: BaseAttributeValues): AttributeModifier[]
  processAll(relics: readonly IRelicInstance[], baseAttributes: BaseAttributeValues): AttributeModifier[]
}
