import { RelicAggregate, RelicRecord } from '../item/Item'
import { ProfessionAggregate } from '../profession/ProfessionTemplate'
import { UltimateAggregate, UltimateRecord } from '../ultimate/Ultimate'
/** 角色記錄，保存角色的基本信息與裝備狀態 */
export interface CharacterRecord {
  readonly id: string
  readonly name: string
  readonly professionId: string
  readonly relics: ReadonlyArray<RelicRecord>
  readonly ultimate: UltimateRecord
  readonly loadCapacity: number
  currentLoad: number
}
/** 角色聚合，包含角色記錄、職業、大絕招與聖物實例 */
export class CharacterAggregate {
  constructor(
    public record: CharacterRecord,
    public profession: ProfessionAggregate,
    public relics: ReadonlyArray<RelicAggregate>,
    public ultimate: UltimateAggregate,
    public loadCapacity: number
  ) {}
  // 裝備聖物
  equipRelic(relic: RelicAggregate): boolean {
    if (this.canEquipRelic(relic)) return false
    this.relics = [...this.relics, relic]
    return true
  }
  // 卸除聖物
  unequipRelic(relicId: string): boolean {
    const index = this.relics.findIndex((r) => r.record.id === relicId)
    if (index === -1) return false
    this.relics = this.relics.filter((r) => r.record.id !== relicId)
    return true
  }
  // 擴展負重
  expandLoadCapacity(increaseAmount: number): boolean {
    if (increaseAmount <= 0) return false
    this.record = {
      ...this.record,
      loadCapacity: this.loadCapacity + increaseAmount,
    }
    return true
  }
  // 檢查是否可以裝備聖物
  canEquipRelic(relic: RelicAggregate): boolean {
    if (this.isOverloaded()) return false
    if (relic.template.loadCost >= this.loadCapacity) return false
    return true
  }
  // 檢查是否超載
  isOverloaded(): boolean {
    return this.record.currentLoad > this.loadCapacity
  }
}
