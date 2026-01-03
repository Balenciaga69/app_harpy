import type { CharacterSnapshot } from '../../interfaces/shared/CharacterSnapshot'
import { nanoid } from 'nanoid'
import type { IUltimateAbility } from '../../interfaces/ultimate/IUltimateAbility'
import { UltimateManager } from './UltimateManager'
import type { ICharacter } from '../../interfaces/character/ICharacter'
import type { ICombatContext } from '../../interfaces/context/ICombatContext'
import { CombatEffectServices } from '../CombatEffectServices'
import { AttributeCalculator } from '@/features/attribute/app/AttributeCalculator'
import { AttributeManager } from '@/features/attribute/app/AttributeManager'
import { IEffect, EffectManager } from '@/features/effect'
import {
  AttributeType,
  AttributeModifier,
  BaseAttributeValues,
  IAttributeCalculator,
  IAttributeManager,
} from '@/features/attribute'
/**
 * 角色初始化所需的設定參數
 */
interface CharacterConfig {
  name: string
  baseAttributes: BaseAttributeValues
  team: ICharacter['team']
  effects?: IEffect[] // 初始效果（來自裝備、遺物等）
  ultimate?: IUltimateAbility
}
/**
 * 角色
 *
 * 代表戰鬥中的實體。使用管理器來組織職責：
 * - EffectManager：管理效果
 * - UltimateManager：管理終極技能
 *
 * 設計變更：
 * - 裝備與遺物的效果在建立角色時直接注入
 *
 * 為簡化使用字串 ID 而非品牌類型。
 */
export class Character implements ICharacter {
  readonly id: string
  readonly name: string
  readonly team: ICharacter['team']
  isDead: boolean = false
  private readonly attributeManager: IAttributeManager
  private readonly attributeCalculator: IAttributeCalculator
  private readonly effectManager: EffectManager
  private readonly ultimateManager: UltimateManager
  private _pendingUltimate?: IUltimateAbility // 用於延遲初始化的終極技能
  constructor(config: CharacterConfig, context?: ICombatContext) {
    this.id = nanoid()
    this.team = config.team
    this.name = config.name
    // 初始化屬性系統
    this.attributeManager = new AttributeManager(config.baseAttributes)
    this.attributeCalculator = new AttributeCalculator()
    // 初始化管理器
    this.effectManager = new EffectManager(this.id)
    this.ultimateManager = new UltimateManager()
    // 注入初始效果（裝備、遺物等）
    if (config.effects && context) {
      const services = new CombatEffectServices(context)
      for (const effect of config.effects) {
        this.effectManager.addEffect(effect, services)
      }
    }
    // 若提供了終極技能且有 context，則註冊終極技能
    if (config.ultimate && context) {
      this.ultimateManager.set(config.ultimate, context)
    } else if (config.ultimate) {
      // 若沒有 context，則暫存以待稍後初始化
      this._pendingUltimate = config.ultimate
    }
  }
  // === 屬性相關方法 ===
  /** 取得最終屬性值（包含修飾計算） */
  getAttribute(type: AttributeType): number {
    const baseValue = this.attributeManager.getBase(type)
    const modifiers = this.attributeManager.getModifiers(type)
    return this.attributeCalculator.calculate(baseValue, modifiers)
  }
  /** 取得基礎屬性值（不含修飾） */
  getBaseAttribute(type: AttributeType): number {
    return this.attributeManager.getBase(type)
  }
  /** 設定基礎屬性值 */
  setBaseAttribute(type: AttributeType, value: number): void {
    this.attributeManager.setBase(type, value)
  }
  /** 新增屬性修飾器 */
  addAttributeModifier(modifier: AttributeModifier): void {
    this.attributeManager.addModifier(modifier)
  }
  /** 移除屬性修飾器 */
  removeAttributeModifier(modifierId: string): void {
    this.attributeManager.removeModifier(modifierId)
  }
  /** 設定當前生命值並限制在合法範圍內（用於受傷/治療時） */
  setCurrentHpClamped(value: number): void {
    const MIN_HP = 0 as const
    const maxHp = this.getAttribute('maxHp')
    const clampedValue = Math.max(MIN_HP, Math.min(value, maxHp))
    this.setBaseAttribute('currentHp', clampedValue)
  }
  // === 效果相關方法（委派給 EffectManager） ===
  /** 新增效果 */
  addEffect(effect: IEffect, context: ICombatContext): void {
    const services = new CombatEffectServices(context)
    this.effectManager.addEffect(effect, services)
  }
  /** 移除效果 */
  removeEffect(effectId: string, context: ICombatContext): void {
    const services = new CombatEffectServices(context)
    this.effectManager.removeEffect(effectId, services)
  }
  /** 檢查是否擁有指定效果 */
  hasEffect(effectId: string): boolean {
    return this.effectManager.hasEffect(effectId)
  }
  /** 取得指定效果 */
  getEffect(effectId: string): IEffect | undefined {
    return this.effectManager.getEffect(effectId)
  }
  /** 取得所有效果 */
  getAllEffects(): readonly IEffect[] {
    return this.effectManager.getAllEffects()
  }
  /** 淨化具有 cleanseOnRevive: true 的效果（用於復活） */
  cleanseCanCleanseEffects(context: ICombatContext): void {
    const services = new CombatEffectServices(context)
    this.effectManager.cleanseOnRevive(services)
  }
  /** 觸發所有效果的 onHpZero 勾子 */
  triggerHpZero(context: ICombatContext): void {
    const services = new CombatEffectServices(context)
    this.effectManager.triggerHpZero(services)
  }
  /** 觸發所有效果的 onRevive 勾子 */
  triggerRevive(context: ICombatContext): void {
    const services = new CombatEffectServices(context)
    this.effectManager.triggerRevive(services)
  }
  // === 終極技能相關方法（委派給 UltimateManager） ===
  /** 取得終極技能（如有） */
  getUltimate(context: ICombatContext): IUltimateAbility | undefined {
    // 如有暫存的終極技能則初始化
    if (this._pendingUltimate) {
      this.ultimateManager.set(this._pendingUltimate, context)
      this._pendingUltimate = undefined
    }
    return this.ultimateManager.get(context)
  }
  /** 設定終極技能 */
  setUltimate(ultimate: IUltimateAbility, context: ICombatContext): void {
    this.ultimateManager.set(ultimate, context)
  }
  // === 快照相關方法 ===
  /** 建立角色快照（用於重播或記錄） */
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
