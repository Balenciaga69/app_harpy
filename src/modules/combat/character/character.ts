import { nanoid } from 'nanoid'
import type { BaseAttributeValues, CharacterId, ICharacter } from '.'
import type { CombatContext } from '../core/CombatContext'
import type { IEffect } from '../effect/models/effect.model'
import { EffectManager } from '../effect/effect.manager'
import { AttributeCalculator } from './attribute.calculator'
import { AttributeContainer } from './attribute.container'
import type { AttributeModifier } from './models/attribute.modifier.model'
import type { AttributeType } from './models/attribute.core.model'
/**
 * 配置角色初始化所需的參數
 */
interface CharacterConfig {
  name: string
  baseAttributes: BaseAttributeValues
  team: ICharacter['team']
}
/**
 * Character：
 * 負責協調屬性容器、計算器與效果管理器，
 * 封裝內部實作，提供統一的對外介面。
 */
export class Character implements ICharacter {
  readonly id: CharacterId
  readonly name: string
  readonly team: ICharacter['team']
  isDead: boolean = false
  // 私有化內部實作
  private readonly attributeContainer: AttributeContainer
  private readonly attributeCalculator: AttributeCalculator
  private readonly effectManager: EffectManager
  /** 初始化角色，注入屬性容器與效果管理器 */
  constructor(config: CharacterConfig) {
    this.id = nanoid()
    this.team = config.team
    this.name = config.name
    this.attributeContainer = new AttributeContainer(config.baseAttributes)
    this.attributeCalculator = new AttributeCalculator(this.attributeContainer)
    this.effectManager = new EffectManager(this)
  }
  // === 屬性相關方法 ===
  /** 獲取最終屬性值（含修飾符計算） */
  getAttribute(type: AttributeType): number {
    return this.attributeCalculator.calculateAttribute(type)
  }
  /** 獲取基礎屬性值（不含修飾符） */
  getBaseAttribute(type: AttributeType): number {
    return this.attributeContainer.getBase(type)
  }
  /** 設置基礎屬性值 */
  setBaseAttribute(type: AttributeType, value: number): void {
    this.attributeContainer.setBase(type, value)
  }
  /** 新增屬性修飾符 */
  addAttributeModifier(modifier: AttributeModifier): void {
    this.attributeContainer.addModifier(modifier)
  }
  /** 移除屬性修飾符 */
  removeAttributeModifier(modifierId: string): void {
    this.attributeContainer.removeModifier(modifierId)
  }
  /** 設置當前 HP，並限制在合法範圍內（受傷/治療時使用） */
  setCurrentHpClamped(value: number): void {
    const MIN_HP = 0 as const
    const maxHp = this.getAttribute('maxHp')
    const clampedValue = Math.max(MIN_HP, Math.min(value, maxHp))
    this.setBaseAttribute('currentHp', clampedValue)
  }
  // === 效果相關方法 ===
  /** 新增效果 */
  addEffect(effect: IEffect, context: CombatContext): void {
    this.effectManager.addEffect(effect, context)
  }
  /** 移除效果 */
  removeEffect(effectId: string, context: CombatContext): void {
    this.effectManager.removeEffect(effectId, context)
  }
  /** 檢查是否有指定效果 */
  hasEffect(effectId: string): boolean {
    return this.effectManager.hasEffect(effectId)
  }
  /** 獲取指定效果 */
  getEffect(effectId: string): IEffect | undefined {
    return this.effectManager.getEffect(effectId)
  }
  /** 獲取所有效果 */
  getAllEffects(): readonly IEffect[] {
    return this.effectManager.getAllEffects()
  }
}
