import { Result } from '../../shared/result/Result'
import { DomainErrorCode } from '../../shared/result/ErrorCodes'
import { RelicEntity, RelicRecord } from '../item/Item'
import { ProfessionAggregate } from '../profession/Profession'
import { UltimateEntity, UltimateRecord } from '../ultimate/Ultimate'
// === Record ===
/** 角色記錄，保存角色的基本資訊與裝備狀態 */
export interface CharacterRecord {
  readonly id: string
  readonly name: string
  readonly professionId: string
  readonly gold: number
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
  private readonly _record: CharacterRecord
  private readonly _profession: ProfessionAggregate
  private readonly _relics: ReadonlyArray<RelicEntity>
  private readonly _ultimate: UltimateEntity
  constructor(
    record: CharacterRecord,
    profession: ProfessionAggregate,
    relics: ReadonlyArray<RelicEntity>,
    ultimate: UltimateEntity
  ) {
    this._record = record
    this._profession = profession
    this._relics = relics
    this._ultimate = ultimate
  }
  // ====== public getters ======
  public get record(): CharacterRecord {
    return this._record
  }
  public get profession(): ProfessionAggregate {
    return this._profession
  }
  public get relics(): ReadonlyArray<RelicEntity> {
    return this._relics
  }
  public get ultimate(): UltimateEntity {
    return this._ultimate
  }
  /** 裝備聖物，返回新的角色聚合實例或失敗原因 */
  public equipRelic(relic: RelicEntity): Result<CharacterAggregate, string> {
    // 檢查是否可裝備（負重與容量限制）
    if (this.isOverloaded(relic.template.loadCost)) {
      return Result.fail(DomainErrorCode.角色_負重超載)
    }
    // 檢查最大堆疊限制
    if (this.isMaxStacks(relic.template.id)) {
      return Result.fail(DomainErrorCode.角色_堆疊已滿)
    }
    // 新聖物直接加入陣列
    return Result.success(this.createWithRelics([...this._relics, relic]))
  }
  /** 卸下聖物，返回新的角色聚合實例或失敗原因 */
  public unequipRelic(relicId: string): Result<CharacterAggregate, string> {
    const targetRelic = this._relics.find((r) => r.record.id === relicId)
    if (!targetRelic) {
      return Result.fail(DomainErrorCode.角色_聖物不存在)
    }
    return Result.success(this.createWithRelics(this._relics.filter((r) => r.record.id !== relicId)))
  }
  /** 擴展負重容量，返回新的角色聚合實例或失敗原因 */
  public expandLoadCapacity(increaseAmount: number): Result<CharacterAggregate, string> {
    // 檢查擴展數值是否合法
    if (increaseAmount <= 0) {
      return Result.fail(DomainErrorCode.角色_擴展容量無效)
    }
    // 建立新的角色記錄，增加負重上限
    const newRecord: CharacterRecord = {
      ...this._record,
      loadCapacity: this._record.loadCapacity + increaseAmount,
    }
    return Result.success(new CharacterAggregate(newRecord, this._profession, this._relics, this._ultimate))
  }
  /** 扣除金錢，返回新的角色聚合實例或失敗原因 */
  public deductGold(amount: number): Result<CharacterAggregate, string> {
    if (this._record.gold < amount) {
      return Result.fail(DomainErrorCode.角色_金錢不足)
    }
    const newRecord: CharacterRecord = {
      ...this._record,
      gold: this._record.gold - amount,
    }
    return Result.success(new CharacterAggregate(newRecord, this._profession, this._relics, this._ultimate))
  }
  /** 增加金錢，返回新的角色聚合實例 */
  public addGold(amount: number): Result<CharacterAggregate, string> {
    const newRecord: CharacterRecord = {
      ...this._record,
      gold: this._record.gold + amount,
    }
    return Result.success(new CharacterAggregate(newRecord, this._profession, this._relics, this._ultimate))
  }
  /** 取得某一聖物 */
  public getRelic(relicId: string): Result<RelicEntity, string> {
    const relic = this.relics.find((r) => r.record.id === relicId)
    if (!relic) return Result.fail(DomainErrorCode.角色_聖物不存在)
    return Result.success(relic)
  }
  /** 檢查是否超載 */
  public isOverloaded(loadCost: number): boolean {
    return this._record.currentLoad + loadCost > this._record.loadCapacity
  }
  /** 獲取指定聖物的當前堆疊數 */
  public getCurrentStack(relicId: string): number {
    const stacksMap = CharacterRecordHelper.getRelicStackCount(this._record)
    const currentStacks = stacksMap.get(relicId) ?? 0
    return currentStacks
  }
  /** 檢查指定聖物是否達到最大堆疊 */
  private isMaxStacks(relicId: string): boolean {
    const getRelicResult = this.getRelic(relicId)
    if (getRelicResult.isFailure) return false // 如果角色沒有該聖物，則不會達到最大堆疊
    const targetRelic = getRelicResult.value!
    return this.getCurrentStack(relicId) >= targetRelic.maxStacks
  }
  /** 獲取當前負重 */
  public get currentLoad(): number {
    return this.calculateRelicsLoad([...this._relics])
  }
  /** 產生新的角色聚合根( 根據新 relics 陣列 ) */
  private createWithRelics(newRelics: ReadonlyArray<RelicEntity>): CharacterAggregate {
    const newRecord: CharacterRecord = {
      ...this._record,
      relics: newRelics.map((r) => r.record),
      currentLoad: this.calculateRelicsLoad([...newRelics]),
    }
    return new CharacterAggregate(newRecord, this._profession, newRelics, this._ultimate)
  }
  /** 計算遺物集合負重 */
  private calculateRelicsLoad(relics: RelicEntity[]): number {
    return relics.reduce((total, relic) => total + relic.template.loadCost, 0)
  }
}
