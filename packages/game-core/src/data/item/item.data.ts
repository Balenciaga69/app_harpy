import { RelicTemplate } from "../../domain/item/Item"

// ZH_TW: 聖物模板列表

// ZH_TW: 堅毅之心 - 戰士專用遺物，提升 300 最大生命值
const relic_warrior_resolute_heart: RelicTemplate = {
  id: "relic_warrior_resolute_heart",
  name: { tw: "堅毅之心", en: "Resolute Heart" },
  desc: { tw: "堅毅的戰士之心，提升 300 點最大生命值。只有戰士能夠裝備。", en: "A warrior's unwavering heart, increases max HP by 300. Only warriors can equip." },
  itemType: "RELIC",
  rarity: "COMMON",
  affixIds: ["affix_warrior_hp_boost_1"],
  tags: ["HP"],
  loadCost: 1,
  maxStacks: 1,
}

export const RelicTemplateList: RelicTemplate[] = [relic_warrior_resolute_heart]
