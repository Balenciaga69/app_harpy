import { AffixTemplate } from '../../domain/affix/AffixTemplate'
import { AffixEffectTemplate } from '../../domain/affix/effect/AffixEffectTemplate'
// ZH_TW: 毒抗仿射
const affix_chemist_poison_resist_1: AffixTemplate = {
  id: 'affix_chemist_poison_resist_1',
  desc: { tw: '一切毒傷害降低50%', en: 'Reduce all poison damage by 50%' },
  tags: ['POISON'],
  effectIds: ['affix_effect_chemist_poison_resist_1'],
}
const affix_effect_chemist_poison_resist_1: AffixEffectTemplate = {
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
export const AffixTemplateList: AffixTemplate[] = [affix_chemist_poison_resist_1]
export const AffixEffectTemplateList: AffixEffectTemplate[] = [affix_effect_chemist_poison_resist_1]
