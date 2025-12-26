import { RelicInstance } from '../item/itemInstance'
import { RelicTemplate } from '../item/ItemTemplate'
import { UltimateInstance } from '../ultimate/UltimateInstance'
/** 角色介面，定義遊戲主角的核心屬性與行為 */
export interface ICharacter {
  readonly id: string
  readonly name: string
  readonly professionId: string
  readonly relics: ReadonlyArray<RelicInstance>
  readonly ultimate: UltimateInstance
  readonly loadCapacity: number
  // Basic operations
  equipRelic(relicInstance: RelicInstance, relicTemplate: RelicTemplate): boolean
  unequipRelic(relicId: string): boolean
  // Business logic checks
  canEquipRelic(relicInstance: RelicInstance, relicTemplate: RelicTemplate): boolean
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
  private _loadCapacity: number
  constructor(id: string, name: string, professionId: string, ultimate: UltimateInstance, loadCapacity: number = 5) {
    this.id = id
    this.name = name
    this.professionId = professionId
    this.ultimate = ultimate
    this._loadCapacity = loadCapacity
  }
  get loadCapacity(): number {
    return this._loadCapacity
  }
  // 嘗試裝備遺物。
  equipRelic(relicInstance: RelicInstance, relicTemplate: RelicTemplate): boolean {
    if (!this.canEquipRelic(relicInstance, relicTemplate)) return false
    this.relics.push(relicInstance)
    return true
  }
  // 嘗試卸下遺物。
  unequipRelic(relicId: string): boolean {
    const index = this.relics.findIndex((r) => r.id === relicId)
    if (index === -1) return false
    this.relics.splice(index, 1)
    return true
  }
  // 檢查是否可以裝備遺物。
  canEquipRelic(relicInstance: RelicInstance, relicTemplate: RelicTemplate): boolean {
    if (this.relics.length >= this._loadCapacity) return false
    if (relicInstance.currentStacks > relicTemplate.stackLimit) return false
    return true
  }
  // 檢查角色是否超載。
  isOverloaded(): boolean {
    return this.relics.length > this._loadCapacity
  }
  // 嘗試擴展背包容量。
  expandCapacity(newCapacity: number): boolean {
    if (newCapacity <= this._loadCapacity) return false
    this._loadCapacity = newCapacity
    return true
  }
}
