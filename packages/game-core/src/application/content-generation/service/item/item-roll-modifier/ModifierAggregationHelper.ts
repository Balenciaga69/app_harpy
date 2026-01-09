import { ItemRarity, ItemTemplate } from '../../../../../domain/item/Item'
import { ItemRollModifier, ItemRollModifierType } from '../../../../../domain/item/roll/ItemRollModifier'
import { TagType } from '../../../../../shared/models/TagType'
/**
 * 修飾符聚合輔助函數
 * 職責：聚合並計算修飾符的加成倍率，供骰選引擎使用
 * 設計：純函數，無副作用，易於測試
 */
/**
 * 聚合不同類型的修飾符並以乘法合併相同鍵位的倍率
 * 例如：多個 RARITY:RARE 修飾符會相乘其倍率
 */
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
/**
 * 批量聚合 Rarity, Tag, 和 ID 類型的修飾符
 * 返回一個包含所有類型修飾符倍率映射的物件
 */
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
/**
 * 計算樣板最終分配到的權重
 * 根據修飾符的加成倍率與樣板屬性計算權重
 */
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
