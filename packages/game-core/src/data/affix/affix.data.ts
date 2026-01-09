import { AffixTemplate } from '../../domain/affix/Affix'
import { AffixEffect } from '../../domain/affix/effect/AffixEffectTemplate'

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

const affix_ranger_attack_boost_1: AffixTemplate = {
  id: 'affix_ranger_attack_boost_1',
  desc: { tw: '攻擊力提升 200 點', en: 'Increase attack damage by 200' },
  tags: ['ATTACK'],
  effectIds: ['affix_effect_ranger_attack_boost_1'],
}
const affix_effect_ranger_attack_boost_1: AffixEffect = {
  id: 'affix_effect_ranger_attack_boost_1',
  trigger: 'ON_EQUIP',
  conditions: [],
  actions: [
    {
      type: 'STAT_MODIFY',
      stat: 'attackDamage',
      operation: 'ADD',
      value: 200,
    },
  ],
}

const affix_mage_energy_boost_1: AffixTemplate = {
  id: 'affix_mage_energy_boost_1',
  desc: { tw: '能量提升 50 點', en: 'Increase energy by 50' },
  tags: ['ENERGY'],
  effectIds: ['affix_effect_mage_energy_boost_1'],
}
const affix_effect_mage_energy_boost_1: AffixEffect = {
  id: 'affix_effect_mage_energy_boost_1',
  trigger: 'ON_EQUIP',
  conditions: [],
  actions: [
    {
      type: 'STAT_MODIFY',
      stat: 'maxEnergy',
      operation: 'ADD',
      value: 50,
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
  affix_ranger_attack_boost_1,
  affix_mage_energy_boost_1,
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
  affix_effect_ranger_attack_boost_1,
  affix_effect_mage_energy_boost_1,
]
