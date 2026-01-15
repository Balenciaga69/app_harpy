import { DomainErrorCode } from '../../shared/result/ErrorCodes'
import { Result } from '../../shared/result/Result'
import { RelicEntity, RelicRecord } from '../item/Item'
import { ProfessionEntity } from '../profession/Profession'
import { UltimateEntity, UltimateRecord } from '../ultimate/Ultimate'
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
export class Character {
  private readonly _record: CharacterRecord
  private readonly _profession: ProfessionEntity
  private readonly _relics: ReadonlyArray<RelicEntity>
  private readonly _ultimate: UltimateEntity
  constructor(
    record: CharacterRecord,
    profession: ProfessionEntity,
    relics: ReadonlyArray<RelicEntity>,
    ultimate: UltimateEntity
  ) {
    this._record = record
    this._profession = profession
    this._relics = relics
    this._ultimate = ultimate
  }
  public get record(): CharacterRecord {
    return this._record
  }
  public get profession(): ProfessionEntity {
    return this._profession
  }
  public get relics(): ReadonlyArray<RelicEntity> {
    return this._relics
  }
  public get ultimate(): UltimateEntity {
    return this._ultimate
  }
  public equipRelic(relic: RelicEntity): Result<Character, string> {
    if (this.isOverloaded(relic.template.loadCost)) {
      return Result.fail(DomainErrorCode.角色_負重超載)
    }
    if (this.isMaxStacks(relic.template.id)) {
      return Result.fail(DomainErrorCode.角色_堆疊已滿)
    }
    return Result.success(this.createWithRelics([...this._relics, relic]))
  }
  public unequipRelic(relicId: string): Result<Character, string> {
    const targetRelic = this._relics.find((r) => r.record.id === relicId)
    if (!targetRelic) {
      return Result.fail(DomainErrorCode.角色_聖物不存在)
    }
    return Result.success(this.createWithRelics(this._relics.filter((r) => r.record.id !== relicId)))
  }
  public expandLoadCapacity(increaseAmount: number): Result<Character, string> {
    if (increaseAmount <= 0) {
      return Result.fail(DomainErrorCode.角色_擴展容量無效)
    }
    const newRecord: CharacterRecord = {
      ...this._record,
      loadCapacity: this._record.loadCapacity + increaseAmount,
    }
    return Result.success(new Character(newRecord, this._profession, this._relics, this._ultimate))
  }
  public deductGold(amount: number): Result<Character, string> {
    if (this._record.gold < amount) {
      return Result.fail(DomainErrorCode.角色_金錢不足)
    }
    const newRecord: CharacterRecord = {
      ...this._record,
      gold: this._record.gold - amount,
    }
    return Result.success(new Character(newRecord, this._profession, this._relics, this._ultimate))
  }
  public addGold(amount: number): Result<Character, string> {
    const newRecord: CharacterRecord = {
      ...this._record,
      gold: this._record.gold + amount,
    }
    return Result.success(new Character(newRecord, this._profession, this._relics, this._ultimate))
  }
  public getRelic(relicId: string): Result<RelicEntity, string> {
    const relic = this.relics.find((r) => r.record.id === relicId)
    if (!relic) return Result.fail(DomainErrorCode.角色_聖物不存在)
    return Result.success(relic)
  }
  public isOverloaded(loadCost: number): boolean {
    return this._record.currentLoad + loadCost > this._record.loadCapacity
  }
  public getCurrentStack(relicId: string): number {
    const stacksMap = CharacterRecordHelper.getRelicStackCount(this._record)
    const currentStacks = stacksMap.get(relicId) ?? 0
    return currentStacks
  }
  private isMaxStacks(relicId: string): boolean {
    const getRelicResult = this.getRelic(relicId)
    if (getRelicResult.isFailure) return false
    const targetRelic = getRelicResult.value!
    return this.getCurrentStack(relicId) >= targetRelic.maxStacks
  }
  public get currentLoad(): number {
    return this.calculateRelicsLoad([...this._relics])
  }
  private createWithRelics(newRelics: ReadonlyArray<RelicEntity>): Character {
    const newRecord: CharacterRecord = {
      ...this._record,
      relics: newRelics.map((r) => r.record),
      currentLoad: this.calculateRelicsLoad([...newRelics]),
    }
    return new Character(newRecord, this._profession, newRelics, this._ultimate)
  }
  private calculateRelicsLoad(relics: RelicEntity[]): number {
    return relics.reduce((total, relic) => total + relic.template.loadCost, 0)
  }
}
