import { RelicInstance } from '../item/itemInstance'
import { UltimateInstance } from '../ultimate/UltimateInstance'

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
   * 嘗試裝備遺物。
   * - 邊界條件：
   *   - 背包未達容量上限。
   *   - 遺物未存在於背包中。
   * - 副作用：
   *   - 若成功，遺物將被加入背包。
   */
  equipRelic(relic: RelicInstance): boolean {
    if (!this.canEquipRelic(relic)) return false
    this.relics.push(relic)
    return true
  }

  /**
   * 嘗試卸下遺物。
   * - 邊界條件：
   *   - 遺物必須存在於背包中。
   * - 副作用：
   *   - 若成功，遺物將從背包中移除。
   */
  unequipRelic(relicId: string): boolean {
    const index = this.relics.findIndex((r) => r.id === relicId)
    if (index === -1) return false
    this.relics.splice(index, 1)
    return true
  }

  /**
   * 檢查是否可以裝備遺物。
   * - 邊界條件：
   *   - 背包未達容量上限。
   *   - 遺物未存在於背包中。
   */
  canEquipRelic(relic: RelicInstance): boolean {
    if (this.relics.length >= this._capacity) return false
    if (this.relics.some((r) => r.id === relic.id)) return false
    return true
  }

  /**
   * 檢查角色是否超載。
   */
  isOverloaded(): boolean {
    return this.relics.length > this._capacity
  }

  /**
   * 嘗試擴展背包容量。
   * - 邊界條件：
   *   - 新容量必須大於當前容量。
   * - 副作用：
   *   - 若成功，背包容量將被更新。
   */
  expandCapacity(newCapacity: number): boolean {
    if (newCapacity <= this._capacity) return false
    this._capacity = newCapacity
    return true
  }
}
