import type { AttributeModifier } from '@/features/attribute/interfaces/AttributeModifier'
import type { IBaseAttributeValues } from '@/features/attribute/interfaces/IBaseAttributeValues'
import type { IRelicInstance } from '@/features/item/interfaces/definitions/IItemInstance'

export interface IRelicProcessor {
  process(relic: IRelicInstance, baseAttributes: IBaseAttributeValues): AttributeModifier[]
  processAll(relics: readonly IRelicInstance[], baseAttributes: IBaseAttributeValues): AttributeModifier[]
}
