import { IAffixAttributeMapping } from '../attribute-mappings/AffixAttributeMapping'

/**
 * 詞綴屬性映射註冊表
 *
 * 定義每個詞綴如何影響角色屬性。
 * 這是靜態配置，與戰鬥內的動態 Effect 分離。
 */
export const AFFIX_ATTRIBUTE_MAPPINGS: readonly IAffixAttributeMapping[] = [
  // 攻擊類詞綴
  {
    affixId: 'affix_attack_damage',
    attributeType: 'attackDamage',
    mode: 'add',
  },
  {
    affixId: 'affix_critical_chance',
    attributeType: 'criticalChance',
    mode: 'add',
  },
  {
    affixId: 'affix_critical_multiplier',
    attributeType: 'criticalMultiplier',
    mode: 'add',
  },
  {
    affixId: 'affix_accuracy',
    attributeType: 'accuracy',
    mode: 'add',
  },
  // 防禦類詞綴
  {
    affixId: 'affix_max_hp',
    attributeType: 'maxHp',
    mode: 'add',
  },
  {
    affixId: 'affix_armor',
    attributeType: 'armor',
    mode: 'add',
  },
  {
    affixId: 'affix_evasion',
    attributeType: 'evasion',
    mode: 'add',
  },
  // 機制類詞綴
  {
    affixId: 'affix_energy_regen',
    attributeType: 'energyRegen',
    mode: 'add',
  },
  {
    affixId: 'affix_energy_gain_on_attack',
    attributeType: 'energyGainOnAttack',
    mode: 'add',
  },
  {
    affixId: 'affix_resurrection_chance',
    attributeType: 'resurrectionChance',
    mode: 'add',
  },
] /** 快速查找：從詞綴 ID 獲取映射配置 */
export const AFFIX_MAPPING_LOOKUP = new Map<string, IAffixAttributeMapping>(
  AFFIX_ATTRIBUTE_MAPPINGS.map((mapping) => [mapping.affixId, mapping])
)
