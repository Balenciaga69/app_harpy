import { AffixTemplate } from '../../domain/affix/Affix'
import { AffixEffect } from '../../domain/affix/effect/AffixEffectTemplate'
// ZH_TW: 毒抗詞綴
const affix_chemist_poison_resist_1: AffixTemplate = {
  id: 'affix_chemist_poison_resist_1',
  desc: { tw: '一切毒傷害降低50%', en: 'Reduce all poison damage by 50%' },
  tags: ['POISON'],
  effectIds: ['affix_effect_chemist_poison_resist_1'],
}
const affix_effect_chemist_poison_resist_1: AffixEffect = {
  id: 'affix_effect_chemist_poison_resist_1',
  trigger: 'ON_BEFORE_DAMAGE',
  conditions: [{ comparator: 'EQUAL_TO', property: 'DAMAGE_TYPE', target: 'SELF', value: 'POISON' }],
  actions: [
    {
      type: 'STAT_MODIFY',
      stat: 'evasion',
      operation: 'MULTIPLY',
      value: 0.5,
    },
  ],
}
// ZH_TW: 戰士 HP 提升詞綴 - 堅毅之心使用
const affix_warrior_hp_boost_1: AffixTemplate = {
  id: 'affix_warrior_hp_boost_1',
  desc: { tw: '最大生命值提升 300 點', en: 'Increase max HP by 300' },
  tags: ['HP'],
  effectIds: ['affix_effect_warrior_hp_boost_1'],
}
const affix_effect_warrior_hp_boost_1: AffixEffect = {
  id: 'affix_effect_warrior_hp_boost_1',
  trigger: 'ON_EQUIP',
  conditions: [],
  actions: [
    {
      type: 'STAT_MODIFY',
      stat: 'maxHp',
      operation: 'ADD',
      value: 300,
    },
  ],
}
// ZH_TW: 戰士攻擊力提升詞綴 - 寒鋒匕首使用
const affix_warrior_attack_boost_3: AffixTemplate = {
  id: 'affix_warrior_attack_boost_3',
  desc: { tw: '攻擊力提升 3 點', en: 'Increase attack damage by 3' },
  tags: ['ATTACK'],
  effectIds: ['affix_effect_warrior_attack_boost_3'],
}
const affix_effect_warrior_attack_boost_3: AffixEffect = {
  id: 'affix_effect_warrior_attack_boost_3',
  trigger: 'ON_EQUIP',
  conditions: [],
  actions: [
    {
      type: 'STAT_MODIFY',
      stat: 'attackDamage',
      operation: 'ADD',
      value: 3,
    },
  ],
}
// ZH_TW: 復活機率提升詞綴 - 永生骨董使用
const affix_universal_resurrection_boost_3: AffixTemplate = {
  id: 'affix_universal_resurrection_boost_3',
  desc: { tw: '復活機率提升 3%', en: 'Increase resurrection chance by 3%' },
  tags: ['RESURRECTION'],
  effectIds: ['affix_effect_universal_resurrection_boost_3'],
}
const affix_effect_universal_resurrection_boost_3: AffixEffect = {
  id: 'affix_effect_universal_resurrection_boost_3',
  trigger: 'ON_EQUIP',
  conditions: [],
  actions: [
    {
      type: 'STAT_MODIFY',
      stat: 'resurrectionChance',
      operation: 'ADD',
      value: 0.03,
    },
  ],
}
// ZH_TW: 海盜萊姆酒效果詞綴 - 提升攻擊力，降低閃避
const affix_pirate_rum_effect: AffixTemplate = {
  id: 'affix_pirate_rum_effect',
  desc: { tw: '攻擊力+5，閃避-5%', en: 'Attack +5, Evasion -5%' },
  tags: ['ATTACK', 'EVASION'],
  effectIds: ['affix_effect_pirate_rum_attack', 'affix_effect_pirate_rum_evasion'],
}
const affix_effect_pirate_rum_attack: AffixEffect = {
  id: 'affix_effect_pirate_rum_attack',
  trigger: 'ON_EQUIP',
  conditions: [],
  actions: [
    {
      type: 'STAT_MODIFY',
      stat: 'attackDamage',
      operation: 'ADD',
      value: 5,
    },
  ],
}
const affix_effect_pirate_rum_evasion: AffixEffect = {
  id: 'affix_effect_pirate_rum_evasion',
  trigger: 'ON_EQUIP',
  conditions: [],
  actions: [
    {
      type: 'STAT_MODIFY',
      stat: 'evasion',
      operation: 'MULTIPLY',
      value: 0.95,
    },
  ],
}
// ZH_TW: 死靈巫師復活加倍詞綴
const affix_necromancer_resurrection_double: AffixTemplate = {
  id: 'affix_necromancer_resurrection_double',
  desc: { tw: '復活機率加倍', en: 'Double resurrection chance' },
  tags: ['RESURRECTION'],
  effectIds: ['affix_effect_necromancer_resurrection_double'],
}
const affix_effect_necromancer_resurrection_double: AffixEffect = {
  id: 'affix_effect_necromancer_resurrection_double',
  trigger: 'ON_EQUIP',
  conditions: [],
  actions: [
    {
      type: 'STAT_MODIFY',
      stat: 'resurrectionChance',
      operation: 'MULTIPLY',
      value: 2.0,
    },
  ],
}
// ZH_TW: 見習騎士鎖子甲效果詞綴 - 提升生命值與閃避
const affix_squire_chainmail_boost: AffixTemplate = {
  id: 'affix_squire_chainmail_boost',
  desc: { tw: '生命值+100，閃避+10%', en: 'HP +100, Evasion +10%' },
  tags: ['HP', 'EVASION'],
  effectIds: ['affix_effect_squire_chainmail_hp', 'affix_effect_squire_chainmail_evasion'],
}
const affix_effect_squire_chainmail_hp: AffixEffect = {
  id: 'affix_effect_squire_chainmail_hp',
  trigger: 'ON_EQUIP',
  conditions: [],
  actions: [
    {
      type: 'STAT_MODIFY',
      stat: 'maxHp',
      operation: 'ADD',
      value: 100,
    },
  ],
}
const affix_effect_squire_chainmail_evasion: AffixEffect = {
  id: 'affix_effect_squire_chainmail_evasion',
  trigger: 'ON_EQUIP',
  conditions: [],
  actions: [
    {
      type: 'STAT_MODIFY',
      stat: 'evasion',
      operation: 'ADD',
      value: 0.1,
    },
  ],
}
export const AffixTemplateList: AffixTemplate[] = [
  affix_chemist_poison_resist_1,
  affix_warrior_hp_boost_1,
  affix_warrior_attack_boost_3,
  affix_universal_resurrection_boost_3,
  affix_pirate_rum_effect,
  affix_necromancer_resurrection_double,
  affix_squire_chainmail_boost,
]
export const AffixEffectTemplateList: AffixEffect[] = [
  affix_effect_chemist_poison_resist_1,
  affix_effect_warrior_hp_boost_1,
  affix_effect_warrior_attack_boost_3,
  affix_effect_universal_resurrection_boost_3,
  affix_effect_pirate_rum_attack,
  affix_effect_pirate_rum_evasion,
  affix_effect_necromancer_resurrection_double,
  affix_effect_squire_chainmail_hp,
  affix_effect_squire_chainmail_evasion,
]
