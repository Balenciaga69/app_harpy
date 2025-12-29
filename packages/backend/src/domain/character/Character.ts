import { RelicAggregate, RelicRecord } from '../item/Item'
import { ProfessionAggregate } from '../profession/Profession'
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
  /** 裝備聖物，返回新的角色聚合實例 如果是同樣 id 的聖物則自動調用 addStack() 增加堆疊，而非塞入新的 */
  public equipRelic(relic: RelicAggregate): CharacterAggregate | null {
    // 檢查是否可裝備（負重與容量限制）
    if (!this.canEquipRelic(relic)) return null
    // 查找是否已有同 id 的聖物
    const existingRelicIndex = this.relics.findIndex((r) => r.record.id === relic.record.id)
    // 若已存在，嘗試堆疊
    if (existingRelicIndex !== -1) {
      const existingRelic = this.relics[existingRelicIndex]
      const stackedRelic = existingRelic.addStack()
      // 堆疊已達上限則失敗
      if (!stackedRelic) return null
      // 替換陣列中的該聖物為堆疊後的新實例
      const newRelics = [...this.relics]
      newRelics[existingRelicIndex] = stackedRelic
      return this.createWithRelics(newRelics)
    }
    // 新聖物直接加入陣列
    return this.createWithRelics([...this.relics, relic])
  }
  /** 卸除聖物，返回新的角色聚合實例 如果是堆疊的聖物( currentStacks > 1 )則自動調用 removeStack() 減少堆疊，而非完全移除 */
  public unequipRelic(relicId: string): CharacterAggregate | null {
    // 查找指定 id 的聖物索引
    const relicIndex = this.relics.findIndex((r) => r.record.id === relicId)
    if (relicIndex === -1) return null
    // 取得目標聖物
    const relic = this.relics[relicIndex]
    // 若有堆疊，僅減少堆疊層數
    if (relic.currentStacks > 1) {
      const unstackedRelic = relic.removeStack()
      // 理論上不會發生，保險檢查
      if (!unstackedRelic) return null
      // 替換為減少堆疊後的新實例
      const newRelics = [...this.relics]
      newRelics[relicIndex] = unstackedRelic
      return this.createWithRelics(newRelics)
    }
    // 堆疊為 1，直接移除該聖物
    return this.createWithRelics(this.relics.filter((r) => r.record.id !== relicId))
  }
  /** 擴展負重容量，返回新的角色聚合實例 */
  public expandLoadCapacity(increaseAmount: number): CharacterAggregate | null {
    // 檢查擴展數值是否合法
    if (increaseAmount <= 0) return null
    // 建立新的角色記錄，增加負重上限
    const newRecord: CharacterRecord = {
      ...this.record,
      loadCapacity: this.record.loadCapacity + increaseAmount,
    }
    return new CharacterAggregate(newRecord, this.profession, this.relics, this.ultimate)
  }
  /** 檢查是否可以裝備聖物 */
  public canEquipRelic(relic: RelicAggregate): boolean {
    if (this.isOverloaded()) return false
    const newLoad = this.record.currentLoad + relic.template.loadCost
    return newLoad <= this.record.loadCapacity
  }
  /** 檢查是否超載 */
  public isOverloaded(): boolean {
    return this.record.currentLoad > this.record.loadCapacity
  }
  /** 獲取當前負重 */
  public get currentLoad(): number {
    return this.calculateRelicsLoad([...this.relics])
  }
  /** 產生新的角色聚合根( 根據新 relics 陣列 ) */
  private createWithRelics(newRelics: ReadonlyArray<RelicAggregate>): CharacterAggregate {
    const newRecord: CharacterRecord = {
      ...this.record,
      relics: newRelics.map((r) => r.record),
      currentLoad: this.calculateRelicsLoad([...newRelics]),
    }
    return new CharacterAggregate(newRecord, this.profession, newRelics, this.ultimate)
  }
  /** 計算遺物集合負重 */
  private calculateRelicsLoad(relics: RelicAggregate[]): number {
    return relics.reduce((total, relic) => total + relic.template.loadCost * relic.currentStacks, 0)
  }
}
