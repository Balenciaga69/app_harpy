/**
 * CharacterSheetCalculator 使用範例
 *
 * 展示如何使用角色屬性面板計算器。
 */
import { CharacterSheetCalculator } from '@/logic/character-sheet'
import type { BaseAttributeValues } from '@/domain/attribute'
import type { IEquipmentInstance, IRelicInstance } from '@/domain/item' // 範例：計算戰士角色的屬性面板
export function exampleCalculateWarriorSheet() {
  // 1. 準備角色基礎屬性
  const baseAttributes: BaseAttributeValues = {
    maxHp: 500,
    currentHp: 500,
    maxEnergy: 100,
    currentEnergy: 0,
    energyRegen: 1,
    energyGainOnAttack: 10,
    armor: 20,
    evasion: 0.1,
    attackDamage: 50,
    attackCooldown: 100,
    criticalChance: 0.15,
    criticalMultiplier: 0.5,
    accuracy: 80,
    resurrectionChance: 0.05,
    resurrectionHpPercent: 0.3,
  } // 2. 準備裝備實例（範例：帶有攻擊力和暴擊詞綴的武器）
  const equipments: IEquipmentInstance[] = [
    {
      id: 'equipment-001',
      definitionId: 'basic_sword',
      rarity: 'magic',
      affixes: [
        { affixId: 'affix_attack_damage', value: 25 }, // +25 攻擊力
        { affixId: 'affix_critical_chance', value: 0.08 }, // +8% 暴擊率
      ],
    },
    {
      id: 'equipment-002',
      definitionId: 'leather_armor',
      rarity: 'rare',
      affixes: [
        { affixId: 'affix_max_hp', value: 100 }, // +100 血量
        { affixId: 'affix_armor', value: 15 }, // +15 護甲
      ],
    },
  ] // 3. 準備遺物實例（範例：泰坦之心，將 HP 轉換為護甲）
  const relics: IRelicInstance[] = [
    {
      id: 'relic-001',
      definitionId: 'titans_heart',
      stackCount: 2, // 堆疊 2 個
    },
  ] // 4. 創建計算器並執行計算
  const calculator = new CharacterSheetCalculator()
  const sheet = calculator.calculate({
    baseAttributes,
    equipments,
    relics,
  }) // 5. 輸出結果
  console.log('=== 角色屬性面板 ===')
  console.log('最終攻擊力:', sheet.attributes.attackDamage) // 50 + 25 = 75
  console.log('最終暴擊率:', sheet.attributes.criticalChance) // 0.15 + 0.08 = 0.23
  console.log('最終血量:', sheet.attributes.maxHp) // 500 + 100 = 600
  console.log('最終護甲:', sheet.attributes.armor) // 20 + 15 + (600/10)*2*2 = 20 + 15 + 240 = 275
  console.log('裝備修飾器數量:', sheet.equipmentModifierCount) // 4
  console.log('遺物修飾器數量:', sheet.relicModifierCount) // 1  return sheet
}
