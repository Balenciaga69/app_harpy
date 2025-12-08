import type { ICombatContext } from '@/logic/combat/context/index.ts'
import type { CharacterSnapshot } from '@/logic/combat/infra/shared/index.ts'
import { nanoid } from 'nanoid'
import { AttributeCalculator, AttributeManager } from '../attribute/index.ts'
import type { AttributeType, BaseAttributeValues } from '../attribute/models/attribute-core.ts'
import type { AttributeModifier } from '../attribute/models/attribute-modifier.ts'
import { EffectManager } from '../effect/EffectManager.ts'
import type { IEffect } from '../effect/models/effect.ts'
import { EquipmentManager, RelicManager } from '../item/index.ts'
import type { ICombatEquipment, ICombatRelic } from '../item/models/combat-item.ts'
import type { EquipmentSlot } from '@/domain/item'
import type { IUltimateAbility } from '../ultimate/index.ts'
import { UltimateManager } from '../ultimate/UltimateManager.ts'
import type { ICharacter } from './models/character.ts'

/**
 * 角色初始化所需的設定參數
 */
interface CharacterConfig {
  name: string
  baseAttributes: BaseAttributeValues
  team: ICharacter['team']
  ultimate?: IUltimateAbility
}

/**
 * 角色
 *
 * 代表戰鬥中的實體。使用管理器來組織職責：
 * - EffectManager：管理效果
 * - EquipmentManager：管理裝備槽
 * - RelicManager：管理可堆疊的遺物
 * - UltimateManager：管理終極技能
 *
 * 為簡化使用字串 ID 而非品牌類型。
 */
export class Character implements ICharacter {
  readonly id: string
  readonly name: string
  readonly team: ICharacter['team']
  isDead: boolean = false
  private readonly attributeManager: AttributeManager
  private readonly attributeCalculator: AttributeCalculator
  private readonly effectManager: EffectManager
  private readonly equipmentManager: EquipmentManager
  private readonly relicManager: RelicManager
  private readonly ultimateManager: UltimateManager
  private _pendingUltimate?: IUltimateAbility // 用於延遲初始化的終極技能

  constructor(config: CharacterConfig, context?: ICombatContext) {
    this.id = nanoid()
    this.team = config.team
    this.name = config.name
    // 初始化屬性系統
    this.attributeManager = new AttributeManager(config.baseAttributes)
    this.attributeCalculator = new AttributeCalculator(this.attributeManager)
    // 初始化管理器
    this.effectManager = new EffectManager(this)
    this.equipmentManager = new EquipmentManager(this)
    this.relicManager = new RelicManager(this)
    this.ultimateManager = new UltimateManager()
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
    return this.attributeCalculator.calculateAttribute(type)
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
    this.effectManager.addEffect(effect, context)
  }
  /** 移除效果 */
  removeEffect(effectId: string, context: ICombatContext): void {
    this.effectManager.removeEffect(effectId, context)
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
    this.effectManager.cleanseCanCleanseEffects(context)
  }
  /** 觸發所有效果的 onHpZero 勾子 */
  triggerHpZero(context: ICombatContext): void {
    this.effectManager.triggerHpZero(context)
  }
  /** 觸發所有效果的 onRevive 勾子 */
  triggerRevive(context: ICombatContext): void {
    this.effectManager.triggerRevive(context)
  }

  // === 裝備相關方法（委派給 EquipmentManager） ===
  /** 裝備物品到指定槽位 */
  equipItem(equipment: ICombatEquipment, context: ICombatContext): void {
    this.equipmentManager.equip(equipment, context)
  }
  /** 從指定槽位卸下裝備 */
  unequipItem(slot: EquipmentSlot, context: ICombatContext): void {
    this.equipmentManager.unequip(slot, context)
  }
  /** 取得指定槽位的裝備 */
  getEquipment(slot: EquipmentSlot): ICombatEquipment | undefined {
    return this.equipmentManager.getEquipment(slot)
  }
  /** 取得所有已裝備的物品 */
  getAllEquipment(): ICombatEquipment[] {
    return this.equipmentManager.getAllEquipment()
  }

  // === 遺物相關方法（委派給 RelicManager） ===
  /** 添加遺物（同名遺物會堆疊） */
  addRelic(relic: ICombatRelic, context: ICombatContext): void {
    this.relicManager.add(relic, context)
  }
  /** 移除遺物 */
  removeRelic(relicName: string, context: ICombatContext): void {
    this.relicManager.remove(relicName, context)
  }
  /** 根據名稱取得遺物 */
  getRelic(relicName: string): ICombatRelic | undefined {
    return this.relicManager.getRelic(relicName)
  }
  /** 取得所有遺物 */
  getAllRelics(): ICombatRelic[] {
    return this.relicManager.getAllRelics()
  }
  /** 取得遺物的堆疊數 */
  getRelicStackCount(relicName: string): number {
    return this.relicManager.getStackCount(relicName)
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
