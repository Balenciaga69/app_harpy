import { RelicAggregate, RelicRecord } from '../item/Item'
import { ProfessionAggregate } from '../profession/Profession'
import { UltimateAggregate, UltimateRecord } from '../ultimate/Ultimate'
// === Record ===
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

const getRelicStackCount = (record: CharacterRecord): Map<string, number> => {
  const relics = record.relics
  const map = new Map<string, number>()
  for (const r of relics) {
    map.set(r.templateId, (map.get(r.templateId) ?? 0) + 1)
  }
  return map
}
export const CharacterRecordHelper = {
  getRelicStackCount,
}
// === Aggregate ===
/** 角色聚合，包含角色記錄、職業、大絕招與聖物實例 */
export class CharacterAggregate {
  constructor(
    public readonly record: CharacterRecord,
    public readonly profession: ProfessionAggregate,
    public readonly relics: ReadonlyArray<RelicAggregate>,
    public readonly ultimate: UltimateAggregate
  ) {}
  /** 裝備聖物，返回新的角色聚合實例 */
  public equipRelic(relic: RelicAggregate): CharacterAggregate | null {
    // 檢查是否可裝備（負重與容量限制）
    if (!this.canEquipRelic(relic)) return null
    // 新聖物直接加入陣列
    return this.createWithRelics([...this.relics, relic])
  }
  /** 卸下聖物，返回新的角色聚合實例 */
  public unequipRelic(relicId: string): CharacterAggregate | null {
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
    // 檢查容量限制
    if (this.isOverloaded(relic.template.loadCost)) return false
    // 檢查最大堆疊限制
    if (this.isMaxStacks(relic.template.id)) return false
    // 通過所有檢查，允許裝備
    const newLoad = this.record.currentLoad + relic.template.loadCost
    return newLoad <= this.record.loadCapacity
  }
  /** 檢查是否超載 */
  public isOverloaded(loadCost: number): boolean {
    return this.record.currentLoad + loadCost > this.record.loadCapacity
  }
  /** 獲取指定聖物的當前堆疊數 */
  public getCurrentStack(relicId: string): number {
    const stacksMap = CharacterRecordHelper.getRelicStackCount(this.record)
    const currentStacks = stacksMap.get(relicId) ?? 0
    return currentStacks
  }
  /** 檢查指定聖物是否達到最大堆疊 */
  private isMaxStacks(relicId: string): boolean {
    const targetRelic = this.relics.find((r) => r.record.id === relicId)
    if (!targetRelic) throw new Error('Relic not found')
    return this.getCurrentStack(relicId) >= targetRelic.maxStacks
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
    return relics.reduce((total, relic) => total + relic.template.loadCost, 0)
  }
}
