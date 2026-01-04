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
export const ProfessionTemplateList: ProfessionTemplate[] = [profession_warrior]
