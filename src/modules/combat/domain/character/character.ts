import { nanoid } from 'nanoid'
import type { IUltimateAbility } from '../../coordination'
import type { BaseAttributeValues, CharacterId, ICharacter } from '.'
import type { CombatContext } from '@/modules/combat/context'
import type { IEffect } from '../effect/models/effect.model'
import type { CharacterSnapshot } from './models/character.snapshot.model'
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
  ultimate?: IUltimateAbility
}
/**
 * Character：戰鬥系統中的核心實體，代表參與戰鬥的角色。
 *
 * 設計理念：
 * - 作為 Facade 模式的實現，簡化角色相關操作的介面。
 * - 遵循組合優於繼承原則，通過組合多個專職元件實現複雜功能。
 * - 封裝內部實作細節，僅暴露必要的公開介面，降低外部耦合。
 * - 實作 ICharacter 介面，確保角色行為的一致性與可替換性。
 * - 支援屬性動態修改與效果動態管理，適應戰鬥中的各種變化。
 *
 * 主要職責：
 * - 管理角色的基本資訊。
 * - 提供屬性相關操作介面，委派給內部的容器與計算器處理。
 * - 提供效果相關操作介面，委派給 EffectManager 處理。
 * - 確保 HP 變動時的數值合法性（如限制在 0 到最大值之間）。
 */
export class Character implements ICharacter {
  readonly id: CharacterId
  readonly name: string
  readonly team: ICharacter['team']
  isDead: boolean = false
  /** 角色的大招（可選） */
  private ultimate?: IUltimateAbility
  // 私有化內部實作
  private readonly attributeContainer: AttributeContainer
  private readonly attributeCalculator: AttributeCalculator
  private readonly effectManager: EffectManager
  /** 初始化角色，注入屬性容器與效果管理器 */
  constructor(config: CharacterConfig) {
    this.id = nanoid()
    this.team = config.team
    this.name = config.name
    this.ultimate = config.ultimate
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
  // === 大招相關方法 ===
  /** 獲取大招（如果有） */
  getUltimate(): IUltimateAbility | undefined {
    return this.ultimate
  }
  /** 設置大招 */
  setUltimate(ultimate: IUltimateAbility): void {
    this.ultimate = ultimate
  }

  // === 快照相關方法 ===
  /** 創建角色快照（用於回放、日誌記錄） */
  createSnapshot(): CharacterSnapshot {
    return {
      id: this.id,
      name: this.name,
      currentHp: this.getAttribute('currentHp'),
      maxHp: this.getAttribute('maxHp'),
      isDead: this.isDead,
      effects: this.getAllEffects().map((e) => e.name),
    }
  }
}
