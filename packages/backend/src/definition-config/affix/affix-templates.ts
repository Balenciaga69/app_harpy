import { IAffixDefinition } from '@/features/item/interfaces/definitions/IAffixDefinition'
/* 攻擊類詞綴 */
export const AFFIX_ATTACK_DAMAGE: IAffixDefinition = {
  id: 'affix_attack_damage',
  effectTemplateId: 'effect_attack_damage',
  minValue: 10,
  maxValue: 50,
  weight: 1.0,
  tier: 1,
  tags: ['attack'],
}
export const AFFIX_CRITICAL_CHANCE: IAffixDefinition = {
  id: 'affix_critical_chance',
  effectTemplateId: 'effect_critical_chance',
  minValue: 0.05,
  maxValue: 0.15,
  weight: 0.8,
  tier: 2,
  tags: ['attack'],
}
export const AFFIX_CRITICAL_MULTIPLIER: IAffixDefinition = {
  id: 'affix_critical_multiplier',
  effectTemplateId: 'effect_critical_multiplier',
  minValue: 0.1,
  maxValue: 0.5,
  weight: 0.6,
  tier: 3,
  tags: ['attack'],
}
export const AFFIX_ACCURACY: IAffixDefinition = {
  id: 'affix_accuracy',
  effectTemplateId: 'effect_accuracy',
  minValue: 5,
  maxValue: 20,
  weight: 0.9,
  tier: 1,
  tags: ['attack'],
}
/* 防禦類詞綴 */
export const AFFIX_MAX_HP: IAffixDefinition = {
  id: 'affix_max_hp',
  effectTemplateId: 'effect_max_hp',
  minValue: 50,
  maxValue: 200,
  weight: 1.0,
  tier: 1,
  tags: ['defense'],
}
export const AFFIX_ARMOR: IAffixDefinition = {
  id: 'affix_armor',
  effectTemplateId: 'effect_armor',
  minValue: 5,
  maxValue: 30,
  weight: 1.0,
  tier: 1,
  tags: ['defense'],
}
export const AFFIX_EVASION: IAffixDefinition = {
  id: 'affix_evasion',
  effectTemplateId: 'effect_evasion',
  minValue: 0.03,
  maxValue: 0.12,
  weight: 0.7,
  tier: 2,
  tags: ['defense'],
}
/* 機制類詞綴 */
export const AFFIX_ENERGY_REGEN: IAffixDefinition = {
  id: 'affix_energy_regen',
  effectTemplateId: 'effect_energy_regen',
  minValue: 1,
  maxValue: 5,
  weight: 0.8,
  tier: 2,
  tags: ['mechanic'],
}
export const AFFIX_ENERGY_GAIN_ON_ATTACK: IAffixDefinition = {
  id: 'affix_energy_gain_on_attack',
  effectTemplateId: 'effect_energy_gain_on_attack',
  minValue: 2,
  maxValue: 10,
  weight: 0.7,
  tier: 3,
  tags: ['mechanic'],
}
export const AFFIX_RESURRECTION_CHANCE: IAffixDefinition = {
  id: 'affix_resurrection_chance',
  effectTemplateId: 'effect_resurrection_chance',
  minValue: 0.03,
  maxValue: 0.1,
  weight: 0.5,
  tier: 4,
  tags: ['mechanic'],
}
/* 傳說專屬詞綴 */
export const AFFIX_ZEUS_CHARGE_BOOST: IAffixDefinition = {
  id: 'affix_zeus_charge_boost',
  effectTemplateId: 'effect_zeus_charge_boost',
  minValue: 20, // 固定 +20 armor per charge
  maxValue: 20,
  weight: 0.0, // 不會隨機生成
  tier: 5,
  tags: ['legendary', 'defense'],
}
export const AFFIX_ZEUS_ATTACK_SPEED: IAffixDefinition = {
  id: 'affix_zeus_attack_speed',
  effectTemplateId: 'effect_zeus_attack_speed',
  minValue: 0.04, // 固定 +4% 攻速
  maxValue: 0.04,
  weight: 0.0,
  tier: 5,
  tags: ['legendary', 'attack'],
}
/* 複合型詞綴（未來擴展範例） */
export const AFFIX_HYBRID_HP_ARMOR: IAffixDefinition = {
  id: 'affix_hybrid_hp_armor',
  effectTemplateId: 'effect_hybrid_hp_armor',
  minValue: 30,
  maxValue: 100,
  weight: 0.6,
  tier: 3,
  tags: ['attack', 'defense'], // 複合標籤
}
/* 統一導出 */
export const COMMON_AFFIXES = [
  AFFIX_ATTACK_DAMAGE,
  AFFIX_CRITICAL_CHANCE,
  AFFIX_CRITICAL_MULTIPLIER,
  AFFIX_ACCURACY,
  AFFIX_MAX_HP,
  AFFIX_ARMOR,
  AFFIX_EVASION,
  AFFIX_ENERGY_REGEN,
  AFFIX_ENERGY_GAIN_ON_ATTACK,
  AFFIX_RESURRECTION_CHANCE,
  AFFIX_HYBRID_HP_ARMOR,
]
export const LEGENDARY_AFFIXES = [AFFIX_ZEUS_CHARGE_BOOST, AFFIX_ZEUS_ATTACK_SPEED]
