/**
 * 裝備定義範例（戰士專用）
 */
import type { IEquipmentDefinition } from '@/domain/item'

/* 武器 */
export const IRON_SWORD: IEquipmentDefinition = {
  id: 'iron_sword',
  effectTemplateIds: [],
  affixPoolIds: ['affix_attack_damage', 'affix_critical_chance', 'affix_accuracy'],
  minAffixes: 1,
  maxAffixes: 2,
  slot: 'weapon',
  baseStats: {},
  rarity: 'common',
}

export const STEEL_SWORD: IEquipmentDefinition = {
  id: 'steel_sword',
  effectTemplateIds: [],
  affixPoolIds: ['affix_attack_damage', 'affix_critical_chance', 'affix_critical_multiplier', 'affix_accuracy'],
  minAffixes: 2,
  maxAffixes: 3,
  slot: 'weapon',
  baseStats: {},
  rarity: 'rare',
}

/* 頭盔 */
export const IRON_HELMET: IEquipmentDefinition = {
  id: 'iron_helmet',
  effectTemplateIds: [],
  affixPoolIds: ['affix_max_hp', 'affix_armor', 'affix_evasion'],
  minAffixes: 1,
  maxAffixes: 2,
  slot: 'helmet',
  baseStats: {},
  rarity: 'common',
}

export const STEEL_HELMET: IEquipmentDefinition = {
  id: 'steel_helmet',
  effectTemplateIds: [],
  affixPoolIds: ['affix_max_hp', 'affix_armor', 'affix_evasion'],
  minAffixes: 2,
  maxAffixes: 3,
  slot: 'helmet',
  baseStats: {},
  rarity: 'rare',
}

/* 傳說頭盔：宙斯頭 */
export const ZEUS_HELM: IEquipmentDefinition = {
  id: 'zeus_helm',
  effectTemplateIds: ['effect_zeus_charge_interaction'], // 特殊效果：Charge 互動
  affixPoolIds: ['affix_zeus_charge_boost', 'affix_zeus_attack_speed'], // 固定詞綴
  minAffixes: 2,
  maxAffixes: 2,
  slot: 'helmet',
  baseStats: {},
  rarity: 'legendary',
}

/* 盔甲 */
export const IRON_ARMOR: IEquipmentDefinition = {
  id: 'iron_armor',
  effectTemplateIds: [],
  affixPoolIds: ['affix_max_hp', 'affix_armor'],
  minAffixes: 1,
  maxAffixes: 2,
  slot: 'armor',
  baseStats: {},
  rarity: 'common',
}

export const STEEL_ARMOR: IEquipmentDefinition = {
  id: 'steel_armor',
  effectTemplateIds: [],
  affixPoolIds: ['affix_max_hp', 'affix_armor', 'affix_evasion'],
  minAffixes: 2,
  maxAffixes: 4,
  slot: 'armor',
  baseStats: {},
  rarity: 'rare',
}

/* 鞋子（可 Roll 任意類型） */
export const LEATHER_BOOTS: IEquipmentDefinition = {
  id: 'leather_boots',
  effectTemplateIds: [],
  affixPoolIds: ['affix_max_hp', 'affix_evasion', 'affix_energy_regen', 'affix_hybrid_hp_armor'],
  minAffixes: 1,
  maxAffixes: 3,
  slot: 'boots',
  baseStats: {},
  rarity: 'magic',
}

/* 手套（可 Roll 任意類型） */
export const WARRIOR_GLOVES: IEquipmentDefinition = {
  id: 'warrior_gloves',
  effectTemplateIds: [],
  affixPoolIds: ['affix_attack_damage', 'affix_armor', 'affix_energy_gain_on_attack', 'affix_hybrid_hp_armor'],
  minAffixes: 2,
  maxAffixes: 3,
  slot: 'gloves',
  baseStats: {},
  rarity: 'magic',
}

/* 統一導出 */
export const WARRIOR_EQUIPMENTS = [
  IRON_SWORD,
  STEEL_SWORD,
  IRON_HELMET,
  STEEL_HELMET,
  ZEUS_HELM,
  IRON_ARMOR,
  STEEL_ARMOR,
  LEATHER_BOOTS,
  WARRIOR_GLOVES,
]
