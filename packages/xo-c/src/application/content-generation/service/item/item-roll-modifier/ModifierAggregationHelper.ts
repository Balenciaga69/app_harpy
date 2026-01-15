import { ItemRarity, ItemTemplate } from '../../../../../domain/item/Item'
import { ItemRollModifier, ItemRollModifierType } from '../../../../../domain/item/roll/ItemRollModifier'
import { TagType } from '../../../../../shared/models/TagType'
export const aggregateModifiersByType = (
  modifiers: ItemRollModifier[],
  type: ItemRollModifierType
): Map<string, number> => {
  const result = new Map<string, number>()
  for (const mod of modifiers) {
    if (mod.type !== type) continue
    let key: string
    if (type === 'RARITY') {
      const rarityMod = mod as unknown as { rarity: ItemRarity }
      key = rarityMod.rarity
    } else if (type === 'TAG') {
      const tagMod = mod as unknown as { tag: TagType }
      key = tagMod.tag
    } else {
      const idMod = mod as unknown as { templateId: string }
      key = idMod.templateId
    }
    const current = result.get(key) ?? 1
    result.set(key, current * mod.multiplier)
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
  const idMod = modifiers.idMultipliers.get(template.id)
  if (idMod !== undefined) weight *= idMod
  for (const [tag, multiplier] of modifiers.tagMultipliers.entries()) {
    if (template.tags.includes(tag)) {
      weight *= multiplier
    }
  }
  const rarityMod = modifiers.rarityMultipliers.get(template.rarity)
  if (rarityMod !== undefined) weight *= rarityMod
  return weight
}
