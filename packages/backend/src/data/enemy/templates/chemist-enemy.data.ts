import { EnemyTemplate } from '../../../domain/entity/Enemy'
export const enemy_template_chemist: EnemyTemplate = {
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
