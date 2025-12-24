import { ItemRarity, ItemTemplate } from '../../../../domain/item/ItemTemplate'
import { ItemRollConfig, ItemRollType } from '../../../../domain/item/roll/ItemRollConfig'
import { ItemRollModifier } from '../../../../domain/item/roll/ItemRollModifier'
import { WeightRoller } from '../../../../shared/helpers/WeightRoller'

/** 骰物品類型 */
export const rollItemType = (seed: number, rollConfig: ItemRollConfig): ItemRollType => {
  const itemTypeWeightList = Object.entries(rollConfig.itemTypeWeights).map(([itemType, weight]) => ({
    id: itemType as ItemRollType,
    weight,
  }))
  return WeightRoller.roll<ItemRollType>(seed, itemTypeWeightList)
}

/** 骰稀有度 */
export const rollItemRarity = (seed: number, rollConfig: ItemRollConfig, modifiers: ItemRollModifier[]): ItemRarity => {
  const rarityModifiers = modifiers.filter((mod) => mod.type === 'RARITY')
  const aggregatedMods = new Map<ItemRarity, number>()
  for (const mod of rarityModifiers) {
    aggregatedMods.set(mod.rarity, (aggregatedMods.get(mod.rarity) ?? 1) + mod.multiplier)
  }
  const rarityWeightList = Object.entries(rollConfig.rarityWeights).map(([rarity, weight]) => ({
    id: rarity as ItemRarity,
    weight: weight * (aggregatedMods.get(rarity as ItemRarity) ?? 1),
  }))
  return WeightRoller.roll<ItemRarity>(seed, rarityWeightList)
}

/** 骰物品樣板 */
export const rollItemTemplate = (seed: number, templates: ItemTemplate[]): string => {
  const templateWeightList = templates.map((template) => ({
    id: template.id,
    weight: 1, // TODO: 未來可能會有不同權重
  }))
  return WeightRoller.roll<string>(seed, templateWeightList)
}
