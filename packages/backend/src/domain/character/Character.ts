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
    public readonly record: CharacterRecord,
    public readonly profession: ProfessionAggregate,
    public readonly relics: ReadonlyArray<RelicAggregate>,
    public readonly ultimate: UltimateAggregate
  ) {}
  /**
   * 裝備聖物，返回新的角色聚合實例
   * 如果是同樣 id 的聖物則自動調用 addStack() 增加堆疊，而非塞入新的
   */
  equipRelic(relic: RelicAggregate): CharacterAggregate | null {
    if (!this.canEquipRelic(relic)) return null
    // 檢查是否已有同 id 的聖物
    const existingRelicIndex = this.relics.findIndex((r) => r.record.id === relic.record.id)
    if (existingRelicIndex !== -1) {
      // 已存在，嘗試增加堆疊
      const existingRelic = this.relics[existingRelicIndex]
      const stackedRelic = existingRelic.addStack()
      if (!stackedRelic) return null // 堆疊已滿
      // 替換陣列中的該聖物
      const newRelics = [...this.relics]
      newRelics[existingRelicIndex] = stackedRelic
      const newRecord: CharacterRecord = {
        ...this.record,
        relics: this.record.relics.map((r) => (r.id === existingRelic.record.id ? stackedRelic.record : r)),
      }
      return new CharacterAggregate(newRecord, this.profession, newRelics, this.ultimate)
    }
    // 新聖物，直接加入
    const newRecord: CharacterRecord = {
      ...this.record,
      relics: [...this.record.relics, relic.record],
      currentLoad: this.record.currentLoad + relic.template.loadCost,
    }
    return new CharacterAggregate(newRecord, this.profession, [...this.relics, relic], this.ultimate)
  }
  /**
   * 卸除聖物，返回新的角色聚合實例
   * 如果是堆疊的聖物（currentStacks > 1）則自動調用 removeStack() 減少堆疊，而非完全移除
   */
  unequipRelic(relicId: string): CharacterAggregate | null {
    const relicIndex = this.relics.findIndex((r) => r.record.id === relicId)
    if (relicIndex === -1) return null
    const relic = this.relics[relicIndex]
    // 如果有堆疊，減少堆疊而不是完全移除
    if (relic.currentStacks > 1) {
      const unstackedRelic = relic.removeStack()
      if (!unstackedRelic) return null // 不應該發生，因為 currentStacks > 1
      // 替換陣列中的該聖物
      const newRelics = [...this.relics]
      newRelics[relicIndex] = unstackedRelic
      const newRecord: CharacterRecord = {
        ...this.record,
        relics: this.record.relics.map((r) => (r.id === relic.record.id ? unstackedRelic.record : r)),
      }
      return new CharacterAggregate(newRecord, this.profession, newRelics, this.ultimate)
    }
    // 堆疊為 1，完全移除
    const newRecord: CharacterRecord = {
      ...this.record,
      relics: this.record.relics.filter((r) => r.id !== relicId),
      currentLoad: this.record.currentLoad - relic.template.loadCost,
    }
    return new CharacterAggregate(
      newRecord,
      this.profession,
      this.relics.filter((r) => r.record.id !== relicId),
      this.ultimate
    )
  }
  /**
   * 擴展負重容量，返回新的角色聚合實例
   */
  expandLoadCapacity(increaseAmount: number): CharacterAggregate | null {
    if (increaseAmount <= 0) return null
    const newRecord: CharacterRecord = {
      ...this.record,
      loadCapacity: this.record.loadCapacity + increaseAmount,
    }
    return new CharacterAggregate(newRecord, this.profession, this.relics, this.ultimate)
  }
  /**
   * 檢查是否可以裝備聖物
   */
  canEquipRelic(relic: RelicAggregate): boolean {
    if (this.isOverloaded()) return false
    const newLoad = this.record.currentLoad + relic.template.loadCost
    return newLoad <= this.record.loadCapacity
  }
  /**
   * 檢查是否超載
   */
  isOverloaded(): boolean {
    return this.record.currentLoad > this.record.loadCapacity
  }
}
