import { ItemRarity, ItemTemplate } from '../../../../../domain/item/Item'
import { ItemRollModifier, ItemRollModifierType } from '../../../../../domain/item/roll/ItemRollModifier'
import { TagType } from '../../../../../shared/models/TagType'
export const aggregateModifiersByType = (
  modifiers: ItemRollModifier[],
  type: ItemRollModifierType
): Map<string, number> => {
  const result = new Map<string, number>()
  for (const module_ of modifiers) {
    if (module_.type !== type) continue
    let key: string
    if (type === 'RARITY') {
      const rarityModule = module_ as unknown as { rarity: ItemRarity }
      key = rarityModule.rarity
    } else if (type === 'TAG') {
      const tagModule = module_ as unknown as { tag: TagType }
      key = tagModule.tag
    } else {
      const idModule = module_ as unknown as { templateId: string }
      key = idModule.templateId
    }
    const current = result.get(key) ?? 1
    result.set(key, current * module_.multiplier)
  }
  return result
}
export const aggregateTemplateModifiers = (modifiers: ItemRollModifier[]) => {
  const rarityMap = aggregateModifiersByType(modifiers, 'RARITY')
  const tagMap = aggregateModifiersByType(modifiers, 'TAG')
  const idMap = aggregateModifiersByType(modifiers, 'ID')
  return {
    rarityMultipliers: rarityMap as Map<ItemRarity, number>,
    tagMultipliers: tagMap as Map<TagType, number>,
    idMultipliers: idMap,
  }
}
export const calculateTemplateWeight = (
  template: ItemTemplate,
  modifiers: {
    rarityMultipliers: Map<ItemRarity, number>
    tagMultipliers: Map<TagType, number>
    idMultipliers: Map<string, number>
  },
  baseWeight = 1
): number => {
  let weight = baseWeight
  const idModule = modifiers.idMultipliers.get(template.id)
  if (idModule !== undefined) weight *= idModule
  for (const [tag, multiplier] of modifiers.tagMultipliers.entries()) {
    if (template.tags.includes(tag)) {
      weight *= multiplier
    }
  }
  const rarityModule = modifiers.rarityMultipliers.get(template.rarity)
  if (rarityModule !== undefined) weight *= rarityModule
  return weight
}
