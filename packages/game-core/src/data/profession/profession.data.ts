import { ProfessionTemplate } from '../../domain/profession/Profession'
// ZH_TW: 戰士職業 - 主要使用強大一擊技能，配備堅毅之心遺物
const profession_warrior: ProfessionTemplate = {
  id: 'WARRIOR',
  name: { tw: '戰士', en: 'Warrior' },
  desc: {
    tw: '力量與決心的化身。擁有強大的單體傷害技能，能承受更多傷害。',
    en: 'An embodiment of strength and determination. Possesses powerful single-target damage skills and can endure more damage.',
  },
  startUltimateIds: ['ult_warrior_mighty_blow'],
  startRelicIds: ['relic_warrior_resolute_heart'],
}
// ZH_TW: 遊俠職業 - 主要使用強大一擊技能，配備遊俠之心遺物
const profession_ranger: ProfessionTemplate = {
  id: 'RANGER',
  name: { tw: '遊俠', en: 'Ranger' },
  desc: {
    tw: '精準與敏捷的化身。擅長遠程攻擊與高傷害輸出。',
    en: 'An embodiment of precision and agility. Excels in ranged attacks and high damage output.',
  },
  startUltimateIds: ['ult_warrior_mighty_blow'],
  startRelicIds: ['relic_ranger_heart'],
}
// ZH_TW: 法師職業 - 主要使用強大一擊技能，配備法師之心遺物
const profession_mage: ProfessionTemplate = {
  id: 'MAGE',
  name: { tw: '法師', en: 'Mage' },
  desc: {
    tw: '智慧與魔法的化身。擅長能量操控與魔法傷害。',
    en: 'An embodiment of wisdom and magic. Excels in energy manipulation and magical damage.',
  },
  startUltimateIds: ['ult_warrior_mighty_blow'],
  startRelicIds: ['relic_mage_heart'],
}
export const ProfessionTemplateList: ProfessionTemplate[] = [profession_warrior, profession_ranger, profession_mage]
