import { UltimateTemplate } from '../../domain/ultimate/UltimateTemplate'
// ZH_TW: 化學家毒化擴散
const ultimate_chemist_poison_bomb: UltimateTemplate = {
  id: 'ult_chemist_poison_bomb',
  name: { tw: '毒化擴散', en: 'Toxic Spores' },
  desc: {
    tw: '污染敵方若干花色的牌；被污染的牌在抽到時會觸發化學毒素傷害',
    en: 'Pollute certain suits in the enemy deck. Polluted cards deal chemical toxin damage on draw.',
  },
  tags: ['POISON'],
  energyCost: 80,
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
// ZH_TW: 化學家劇毒護盾
const ultimate_chemist_poison_bomb_shield: UltimateTemplate = {
  id: 'ult_chemist_poison_bomb_shield',
  name: { tw: '劇毒護盾', en: 'Toxic Shield' },
  desc: {
    tw: '污染敵方花色與數字, 被污染的牌在抽到時會造成化學毒素傷害並增加污染計數',
    en: 'Pollute enemy suits and ranks. Polluted cards deal toxin damage on draw and increment toxin counters.',
  },
  tags: ['POISON'],
  energyCost: 100,
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
export const UltimateTemplateList: UltimateTemplate[] = [
  ultimate_chemist_poison_bomb,
  ultimate_chemist_poison_bomb_shield,
]
