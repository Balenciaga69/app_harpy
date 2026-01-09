import { UltimateTemplate } from '../../domain/ultimate/Ultimate'

const ultimate_chemist_poison_bomb: UltimateTemplate = {
  id: 'ult_chemist_poison_bomb',
  name: { tw: '毒煙爆', en: 'Toxic Spores' },
  desc: {
    tw: '汙染敵人牌組的特定花色。被汙染的卡牌在抽取時造成化學毒素傷害。',
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

const ultimate_chemist_poison_bomb_shield: UltimateTemplate = {
  id: 'ult_chemist_poison_bomb_shield',
  name: { tw: '毒盾牌', en: 'Toxic Shield' },
  desc: {
    tw: '汙染敵人牌組和級別。被汙染的卡牌在抽取時造成毒素傷害並增加毒素計數器。',
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

const ultimate_warrior_mighty_blow: UltimateTemplate = {
  id: 'ult_warrior_mighty_blow',
  name: { tw: '強大一擊', en: 'Mighty Blow' },
  desc: {
    tw: '集聚全身的力量，對單個敵人造成 500 點傷害。',
    en: 'Channel all your strength to deal 500 damage to a single enemy.',
  },
  tags: ['PHYSICAL', 'ATTACK'],
  energyCost: 50,
  hooks: [
    {
      event: 'ON_CAST',
      effects: [
        {
          type: 'polluteCards',
          target: 'LOWEST_HP_ENEMY',
        },
      ],
    },
  ],
  metadata: {
    baseDamage: 500,
    targetCount: 1,
  },
}
export const UltimateTemplateList: UltimateTemplate[] = [
  ultimate_chemist_poison_bomb,
  ultimate_chemist_poison_bomb_shield,
  ultimate_warrior_mighty_blow,
]
