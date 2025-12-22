import { EnemyConfig } from '../../../application/store/loader/IEnemyConfigLoader'
import { AffixTemplate } from '../../../domain/affix/AffixTemplate'
import { AffixEffectTemplate } from '../../../domain/affix/effect/AffixEffectTemplate'
import { EnemyTemplate } from '../../../domain/entity/Enemy'
import { UltimateTemplate } from '../../../domain/ultimate/UltimateTemplate'

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
      ultimateId: 'ultimate_chemist_poison_bomb',
    },
    ELITE: {
      affixIds: ['affix_chemist_poison_resist_1', 'affix_chemist_damage_reduction_1', 'affix_chemist_hp_2'],
      ultimateId: 'ultimate_chemist_poison_bomb',
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

const ultimate_chemist_poison_bomb: UltimateTemplate = {
  id: 'ult_chemist_poison_bomb',
  name: { tw: '毒化擴散', en: 'Toxic Spores' },
  desc: {
    tw: '污染敵方若干花色的牌；被污染的牌在抽到時會觸發化學毒素傷害',
    en: 'Pollute certain suits in the enemy deck. Polluted cards deal chemical toxin damage on draw.',
  },
  tags: ['POISON'],
  energyCost: 80,
  // 使用 hooks-only 格式：在 ON_CAST 時污染敵方牌
  hooks: [
    {
      event: 'ON_CAST',
      effects: [
        {
          type: 'polluteCards',
          target: 'ENEMY',
        },
      ],
    },
  ],
}

/*
  BOSS 版：除了污染花色外，亦污染牌面數字（點數）
  - ranksCount 可指定污染幾個數字（每次重抽不可重複）
*/
const ultimate_chemist_poison_bomb_shield: UltimateTemplate = {
  id: 'ult_chemist_poison_bomb_shield',
  name: { tw: '劇毒護盾', en: 'Toxic Shield' },
  desc: {
    tw: '污染敵方花色與數字，被污染的牌在抽到時會造成化學毒素傷害並增加污染計數',
    en: 'Pollute enemy suits and ranks. Polluted cards deal toxin damage on draw and increment toxin counters.',
  },
  tags: ['POISON'],
  energyCost: 100,
  // hooks-only: ON_CAST 時污染花色與數字
  hooks: [
    {
      event: 'ON_CAST',
      effects: [
        {
          type: 'polluteCards',
          target: 'ENEMY',
        },
        {
          type: 'polluteRanks',
          target: 'ENEMY',
        },
      ],
    },
  ],
}

export const chemist_config: EnemyConfig = {
  enemyTemplate: enemy_template_chemist,
  affixTemplates: [affix_chemist_poison_resist_1],
  affixEffects: [affix_effect_chemist_poison_resist_1],
  ultimateTemplate: ultimate_chemist_poison_bomb_shield,
}
