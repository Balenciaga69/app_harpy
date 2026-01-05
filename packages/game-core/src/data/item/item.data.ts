import { RelicTemplate } from '../../domain/item/Item'
// ZH_TW: 聖物模板列表
// ZH_TW: 堅毅之心 - 戰士專用遺物，提升 300 最大生命值
const relic_warrior_resolute_heart: RelicTemplate = {
  id: 'relic_warrior_resolute_heart',
  name: { tw: '堅毅之心', en: 'Resolute Heart' },
  desc: {
    tw: '堅毅的戰士之心，提升 300 點最大生命值。只有戰士能夠裝備。',
    en: "A warrior's unwavering heart, increases max HP by 300. Only warriors can equip.",
  },
  itemType: 'RELIC',
  rarity: 'COMMON',
  affixIds: ['affix_warrior_hp_boost_1'],
  tags: ['HP'],
  loadCost: 1,
  maxStacks: 1,
}
// ZH_TW: 寒鋒匕首 - 提升 3 點攻擊力，可堆疊 30 個
const relic_warrior_frost_dagger: RelicTemplate = {
  id: 'relic_warrior_frost_dagger',
  name: { tw: '寒鋒匕首', en: 'Frost Dagger' },
  desc: {
    tw: '寒冷之地鍛造的匕首，提升 3 點攻擊力。可堆疊 30 個。',
    en: 'A dagger forged in frozen lands, increases attack damage by 3. Can stack up to 30.',
  },
  itemType: 'RELIC',
  rarity: 'COMMON',
  affixIds: ['affix_warrior_attack_boost_3'],
  tags: ['ATTACK'],
  loadCost: 1,
  maxStacks: 30,
}
// ZH_TW: 永生骨董 - 提升 3% 復活機率，最多 5 個
const relic_universal_resurrection_artifact: RelicTemplate = {
  id: 'relic_universal_resurrection_artifact',
  name: { tw: '永生骨董', en: 'Resurrection Artifact' },
  desc: {
    tw: '古老的骨董製品，提升 3% 復活機率。最多可裝備 5 個。',
    en: 'An ancient artifact, increases resurrection chance by 3%. Can equip up to 5.',
  },
  itemType: 'RELIC',
  rarity: 'RARE',
  affixIds: ['affix_universal_resurrection_boost_3'],
  tags: ['RESURRECTION'],
  loadCost: 1,
  maxStacks: 5,
}
// ZH_TW: 海盜萊姆酒 - 提升攻擊力，降低閃避
const relic_pirate_rum: RelicTemplate = {
  id: 'relic_pirate_rum',
  name: { tw: '海盜萊姆酒', en: 'Pirate Rum' },
  desc: {
    tw: '來自海盜的烈酒，提升 5 點攻擊力但降低 5% 閃避率。',
    en: 'Rum from pirates, increases attack damage by 5 but reduces evasion by 5%.',
  },
  itemType: 'RELIC',
  rarity: 'EPIC',
  affixIds: ['affix_pirate_rum_effect'],
  tags: ['ATTACK', 'EVASION'],
  loadCost: 5,
  maxStacks: 1,
}
// ZH_TW: 死靈巫師的擁抱 - 提升復活率
const relic_necromancer_embrace: RelicTemplate = {
  id: 'relic_necromancer_embrace',
  name: { tw: '死靈巫師的擁抱', en: 'Necromancer Embrace' },
  desc: {
    tw: '死靈巫師的詛咒，將復活機率提升至兩倍。',
    en: "Necromancer's curse, doubles the resurrection chance.",
  },
  itemType: 'RELIC',
  rarity: 'LEGENDARY',
  affixIds: ['affix_necromancer_resurrection_double'],
  tags: ['RESURRECTION'],
  loadCost: 10,
  maxStacks: 1,
}
// ZH_TW: 見習騎士鎖子甲 - 提升生命值與閃避
const relic_squire_chainmail: RelicTemplate = {
  id: 'relic_squire_chainmail',
  name: { tw: '見習騎士鎖子甲', en: 'Squire Chainmail' },
  desc: {
    tw: '見習騎士的鎖子甲，提升 100 點生命值與 10% 閃避率。',
    en: 'A squire chainmail, increases HP by 100 and evasion by 10%.',
  },
  itemType: 'RELIC',
  rarity: 'RARE',
  affixIds: ['affix_squire_chainmail_boost'],
  tags: ['HP', 'EVASION'],
  loadCost: 5,
  maxStacks: 1,
}
// ZH_TW: 遊俠之心 - 遊俠專用遺物，提升 200 攻擊力
const relic_ranger_heart: RelicTemplate = {
  id: 'relic_ranger_heart',
  name: { tw: '遊俠之心', en: 'Ranger Heart' },
  desc: {
    tw: '精準的遊俠之心，提升 200 點攻擊力。只有遊俠能夠裝備。',
    en: "A ranger's precise heart, increases attack damage by 200. Only rangers can equip.",
  },
  itemType: 'RELIC',
  rarity: 'COMMON',
  affixIds: ['affix_ranger_attack_boost_1'],
  tags: ['ATTACK'],
  loadCost: 1,
  maxStacks: 1,
}
// ZH_TW: 法師之心 - 法師專用遺物，提升 50 能量
const relic_mage_heart: RelicTemplate = {
  id: 'relic_mage_heart',
  name: { tw: '法師之心', en: 'Mage Heart' },
  desc: {
    tw: '神秘的法師之心，提升 50 點能量。只有法師能夠裝備。',
    en: "A mage's mystical heart, increases energy by 50. Only mages can equip.",
  },
  itemType: 'RELIC',
  rarity: 'COMMON',
  affixIds: ['affix_mage_energy_boost_1'],
  tags: ['ENERGY'],
  loadCost: 1,
  maxStacks: 1,
}
export const RelicTemplateList: RelicTemplate[] = [
  relic_warrior_resolute_heart,
  relic_warrior_frost_dagger,
  relic_universal_resurrection_artifact,
  relic_pirate_rum,
  relic_necromancer_embrace,
  relic_squire_chainmail,
  relic_ranger_heart,
  relic_mage_heart,
]
