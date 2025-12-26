import { RelicInstance } from '../item/itemInstance'
import { UltimateInstance } from '../ultimate/UltimateInstance'
import { UnitStats, DEFAULT_UNIT_STATS } from '../stats/models/UnitStats'
import { UnitStatModifier } from '../stats/models/StatModifier'
import { UnitStatAggregate } from '../stats/UnitStatAggregate'

/**
 * Character interface to define the structure and behavior of a game character.
 */
export interface ICharacter {
  readonly id: string
  readonly name: string
  readonly professionId: string
  readonly relics: ReadonlyArray<RelicInstance>
  readonly ultimate: UltimateInstance
  readonly capacity: number
  // Basic operations
  equipRelic(relic: RelicInstance): boolean
  unequipRelic(relicId: string): boolean
  // Business logic checks
  canEquipRelic(relic: RelicInstance): boolean
  // State checks
  isOverloaded(): boolean
  // Capacity management
  expandCapacity(newCapacity: number): boolean
  // Stat calculation
  calculateDefaultStats(): UnitStats
}

/** 遊戲主角，承載角色的核心屬性與無依賴的邏輯 */
export class Character implements ICharacter {
  readonly id: string
  readonly name: string
  readonly professionId: string
  readonly relics: RelicInstance[] = []
  readonly ultimate: UltimateInstance
  private _capacity: number

  constructor(id: string, name: string, professionId: string, ultimate: UltimateInstance, capacity: number = 5) {
    this.id = id
    this.name = name
    this.professionId = professionId
    this.ultimate = ultimate
    this._capacity = capacity
  }

  get capacity(): number {
    return this._capacity
  }

  /**
   * //TODO: 從多行改單行
   * 嘗試裝備遺物。
   */
  equipRelic(relic: RelicInstance): boolean {
    if (!this.canEquipRelic(relic)) return false
    this.relics.push(relic)
    return true
  }

  /**
   * //TODO: 從多行改單行
   * 嘗試卸下遺物。
   */
  unequipRelic(relicId: string): boolean {
    const index = this.relics.findIndex((r) => r.id === relicId)
    if (index === -1) return false
    this.relics.splice(index, 1)
    return true
  }

  /**
   * //TODO: 從多行改單行
   * 檢查是否可以裝備遺物。
   */
  canEquipRelic(relic: RelicInstance): boolean {
    if (this.relics.length >= this._capacity) return false
    if (this.relics.some((r) => r.id === relic.id)) return false
    return true
  }

  /**
   * //TODO: 從多行改單行
   * 檢查角色是否超載。
   */
  isOverloaded(): boolean {
    return this.relics.length > this._capacity
  }

  /**
   * //TODO: 從多行改單行
   * 嘗試擴展背包容量。
   */
  expandCapacity(newCapacity: number): boolean {
    if (newCapacity <= this._capacity) return false
    this._capacity = newCapacity
    return true
  }

  /**
   * 計算角色在戰鬥外的默認面板數值。
   * - 基於 DEFAULT_UNIT_STATS 與現有遺物的詞綴修飾。
   * - 無副作用。
   * - 邊界條件：遺物必須能轉換為 UnitStatModifier。
   */
  calculateDefaultStats(): UnitStats {
    // TODO: 將遺物上的詞綴轉換為 UnitStatModifier 陣列
    // 當前作為黑盒子，返回空陣列
    const modifiers: UnitStatModifier[] = []
    // 透過 UnitStatAggregate 計算最終屬性
    return UnitStatAggregate(DEFAULT_UNIT_STATS, modifiers)
  }
}
