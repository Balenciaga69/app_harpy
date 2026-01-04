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
export const AffixTemplateList: AffixTemplate[] = [affix_chemist_poison_resist_1, affix_warrior_hp_boost_1]
export const AffixEffectTemplateList: AffixEffect[] = [
  affix_effect_chemist_poison_resist_1,
  affix_effect_warrior_hp_boost_1,
]
