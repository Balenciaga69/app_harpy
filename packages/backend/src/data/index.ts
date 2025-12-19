import { AffixTemplate } from '../domain/affix/AffixTemplate'
import { AffixEffect } from '../domain/affix/effect/AffixEffect'
import { EnemyTemplate } from '../domain/entity/Enemy/Enemy'
import { UltimateEffect } from '../domain/ultimate/UltimateEffect'
import { UltimateTemplate } from '../domain/ultimate/UltimateTemplate'
import { EnemyTemplatePackage } from './enemy/interfaces'

const enemy_template_chemist: EnemyTemplate = {
  id: 'enemy_template_chemist',
  name: { en: 'Chemist', tw: '化學家' },
  desc: {
    tw: '下毒與煉金術的高手',
    en: 'A master of poisons and alchemy',
  },
  roleConfigs: {
    NORMAL: {
      affixIds: ['affix_chemist_poison_resist_1', 'affix_chemist_damage_reduction_1'],
      ultimateId: 'ult_chemist_poison_bomb',
    },
    ELITE: {
      affixIds: ['affix_chemist_poison_resist_1', 'affix_chemist_damage_reduction_1', 'affix_chemist_hp_2'],
      ultimateId: 'ult_chemist_poison_bomb',
    },
    BOSS: {
      affixIds: ['affix_chemist_poison_resist_1', 'affix_chemist_damage_reduction_1', 'affix_chemist_hp_2'],
      ultimateId: 'ult_chemist_poison_bomb_shield',
    },
  },
}

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
      stat: 'damageReduction',
      operation: 'MULTIPLY',
      value: 0.5,
    },
  ],
}

export const ultimate_chemist_poison_bomb_shield: UltimateTemplate = {
  id: 'ult_chemist_poison_bomb_shield',
  name: { tw: '劇毒護盾', en: 'Toxic Shield' },
  desc: {
    tw: '獲得一個護盾，能阻擋 30 傷害，同時攻擊者受到 30 層中毒',
    en: 'Gain a shield that blocks 30 damage; attacker receives 30 poison stacks',
  },
  tags: ['POISON'],
  energyCost: 100,
  effectIds: ['ult_effect_chemist_gain_shield_30', 'ult_effect_chemist_poison_attacker_30'],
}

// UltimateEffect: 獲得護盾
export const ult_effect_chemist_gain_shield_30: UltimateEffect = {
  type: 'addStat',
  target: 'SELF',
  stat: 'damageReduction',
  value: 30,
  duration: 10000, // 100SEC
}
// UltimateEffect: 攻擊者受到 30 層中毒
export const ult_effect_chemist_poison_enemy_30: UltimateEffect = {
  type: 'applyAilment',
  target: 'ENEMY',
  ailment: 'POISON',
  layers: 30,
}

export const chemist_templatePackage: EnemyTemplatePackage = {
  enemyTemplate: enemy_template_chemist,
  affixTemplates: [affix_chemist_poison_resist_1],
  affixEffects: [affix_effect_chemist_poison_resist_1],
  ultimateTemplate: ultimate_chemist_poison_bomb_shield,
  ultimateEffects: [ult_effect_chemist_gain_shield_30, ult_effect_chemist_poison_enemy_30],
}
