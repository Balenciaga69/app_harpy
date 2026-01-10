import type { AttributeType } from '@/features/attribute/interfaces/AttributeType'
import type { IAttributeManager } from '@/features/attribute/interfaces/IAttributeManager'
import type { IAttributeCalculator } from '@/features/attribute/interfaces/IAttributeCalculator'
import type { ICharacterSheet } from '../interfaces/ICharacterSheet'
import type { ICharacterSheetInput } from '../interfaces/ICharacterSheetInput'
import type { IEquipmentProcessor } from '../interfaces/IEquipmentProcessor'
import type { IRelicProcessor } from '../interfaces/IRelicProcessor'
import type { ICharacterSheetCalculator } from '../interfaces/ICharacterSheetCalculator'
const ATTRIBUTE_TYPES: readonly AttributeType[] = [
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
] as const
export class CharacterSheetCalculator implements ICharacterSheetCalculator {
  private readonly equipmentProcessor: IEquipmentProcessor
  private readonly relicProcessor: IRelicProcessor
  private readonly createAttributeManager: (baseAttributes: any) => IAttributeManager
  private readonly createAttributeCalculator: (manager: IAttributeManager) => IAttributeCalculator
  constructor(
    equipmentProcessor: IEquipmentProcessor,
    relicProcessor: IRelicProcessor,
    createAttributeManager: (baseAttributes: any) => IAttributeManager,
    createAttributeCalculator: (manager: IAttributeManager) => IAttributeCalculator
  ) {
    this.equipmentProcessor = equipmentProcessor
    this.relicProcessor = relicProcessor
    this.createAttributeManager = createAttributeManager
    this.createAttributeCalculator = createAttributeCalculator
  }
  /**
   * 計算角色屬性面板
   *
   * @param input - 包含基礎屬性、裝備和遺物的輸入
   * @returns 計算後的屬性面板快照
   */
  calculate(input: ICharacterSheetInput): ICharacterSheet {
    // 初始化屬性管理器（使用基礎屬性）
    const attributeManager = this.createAttributeManager(input.baseAttributes)
    const attributeCalculator = this.createAttributeCalculator(attributeManager)
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
    const attributes = this.calculateAllAttributes(attributeManager, attributeCalculator)
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
  private calculateAllAttributes(
    manager: IAttributeManager,
    calculator: IAttributeCalculator
  ): Record<AttributeType, number> {
    const result = {} as Record<AttributeType, number>
    for (const type of ATTRIBUTE_TYPES) {
      const baseValue = manager.getBase(type)
      const modifiers = manager.getModifiers(type)
      result[type] = calculator.calculate(baseValue, modifiers)
    }
    return result
  }
  /**
   * 提取基礎屬性值（不含修飾器）
   */
  private extractBaseAttributes(manager: IAttributeManager): Record<AttributeType, number> {
    const result = {} as Record<AttributeType, number>
    for (const type of ATTRIBUTE_TYPES) {
      result[type] = manager.getBase(type)
    }
    return result
  }
}
