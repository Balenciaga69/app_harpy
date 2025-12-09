import type { AttributeType } from '@/domain/attribute'
import { AttributeManager, AttributeCalculator } from '@/logic/attribute-system'
import type { ICharacterSheet } from './models/character-sheet'
import type { ICharacterSheetInput } from './models/sheet-input'
import { EquipmentProcessor } from './processors/EquipmentProcessor'
import { RelicProcessor } from './processors/RelicProcessor' /**
 * 角色屬性面板計算器
 *
 * 負責計算角色的最終屬性面板（靜態數據，用於 UI 展示）。
 * 整合裝備與遺物的屬性增益，使用與戰鬥系統相同的計算邏輯。
 *
 * 設計原則：
 * - 純函數：無副作用，可重複計算
 * - 複用：使用 AttributeManager 和 AttributeCalculator
 * - 低耦合：僅依賴 domain 和 attribute-system
 */
export class CharacterSheetCalculator {
  private readonly equipmentProcessor: EquipmentProcessor
  private readonly relicProcessor: RelicProcessor
  constructor() {
    this.equipmentProcessor = new EquipmentProcessor()
    this.relicProcessor = new RelicProcessor()
  }
  /**
   * 計算角色屬性面板
   *
   * @param input - 包含基礎屬性、裝備和遺物的輸入
   * @returns 計算後的屬性面板快照
   */
  calculate(input: ICharacterSheetInput): ICharacterSheet {
    // 初始化屬性管理器（使用基礎屬性）
    const attributeManager = new AttributeManager(input.baseAttributes)
    const attributeCalculator = new AttributeCalculator(attributeManager)
    // 處理裝備：提取屬性修飾器並添加到管理器
    const equipmentModifiers = this.equipmentProcessor.processAll(input.equipments)
    for (const modifier of equipmentModifiers) {
      attributeManager.addModifier(modifier)
    }
    // 處理遺物：提取屬性修飾器並添加到管理器
    const relicModifiers = this.relicProcessor.processAll(input.relics, input.baseAttributes)
    for (const modifier of relicModifiers) {
      attributeManager.addModifier(modifier)
    }
    // 計算所有屬性的最終值
    const attributes = this.calculateAllAttributes(attributeCalculator)
    const baseAttributes = this.extractBaseAttributes(attributeManager)
    return {
      attributes,
      baseAttributes,
      equipmentModifierCount: equipmentModifiers.length,
      relicModifierCount: relicModifiers.length,
    }
  }
  /**
   * 計算所有屬性的最終值
   */
  private calculateAllAttributes(calculator: AttributeCalculator): Record<AttributeType, number> {
    const attributeTypes: AttributeType[] = [
      'maxHp',
      'currentHp',
      'maxEnergy',
      'currentEnergy',
      'energyRegen',
      'energyGainOnAttack',
      'armor',
      'evasion',
      'attackDamage',
      'attackCooldown',
      'criticalChance',
      'criticalMultiplier',
      'accuracy',
      'resurrectionChance',
      'resurrectionHpPercent',
    ]
    const result = {} as Record<AttributeType, number>
    for (const type of attributeTypes) {
      result[type] = calculator.calculateAttribute(type)
    }
    return result
  }
  /**
   * 提取基礎屬性值（不含修飾器）
   */
  private extractBaseAttributes(manager: AttributeManager): Record<AttributeType, number> {
    const attributeTypes: AttributeType[] = [
      'maxHp',
      'currentHp',
      'maxEnergy',
      'currentEnergy',
      'energyRegen',
      'energyGainOnAttack',
      'armor',
      'evasion',
      'attackDamage',
      'attackCooldown',
      'criticalChance',
      'criticalMultiplier',
      'accuracy',
      'resurrectionChance',
      'resurrectionHpPercent',
    ]
    const result = {} as Record<AttributeType, number>
    for (const type of attributeTypes) {
      result[type] = manager.getBase(type)
    }
    return result
  }
}
