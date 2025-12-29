import { BaseInstanceFields, WithCreatedInfo } from '../../shared/models/BaseInstanceFields'
import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'
import { AffixRecord, AffixAggregate } from '../affix/Affix'
export type ItemType = 'RELIC' | 'NONE' | 'UFO'
/** 物品稀有度等級，決定物品的品質與掉落概率 */
export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
/** 物品樣板，定義物品的靜態屬性、詞綴與標籤 */
export interface ItemTemplate {
  readonly id: string
  readonly name: I18nField
  readonly desc: I18nField
  readonly itemType: ItemType
  readonly rarity: ItemRarity
  readonly affixIds: ReadonlyArray<string>
  readonly tags: ReadonlyArray<TagType>
  readonly loadCost: number
}
/** 遺物樣板，擴展物品樣板並定義最大堆疊層數 */
export interface RelicTemplate extends ItemTemplate {
  readonly maxStacks: number
  readonly itemType: 'RELIC'
}
/** 物品記錄，包含基礎欄位與詞綴資訊 */
export interface ItemRecord extends BaseInstanceFields, WithCreatedInfo {
  readonly affixRecords: ReadonlyArray<AffixRecord>
  readonly itemType: ItemType
}
/** 遺物記錄，擴展物品記錄並包含當前堆疊層數 */
export interface RelicRecord extends ItemRecord {
  readonly currentStacks: number
  readonly itemType: 'RELIC'
}
export abstract class ItemAggregate {
  constructor(
    public record: ItemRecord,
    public readonly template: ItemTemplate,
    public readonly affixAggregates: ReadonlyArray<AffixAggregate> = []
  ) {}
  /**
   * 計算物品裝備時帶來的單位屬性修改器集合
   * - 遍歷所有詞綴聚合，匯聚其屬性修改器
   */
  getUnitStatModifiers() {
    return this.affixAggregates.flatMap((affix) => affix.getUnitStatModifiers())
  }
}
/** 遺物聚合，包含遺物記錄、樣板與詞綴快照集合 */
export class RelicAggregate extends ItemAggregate {
  constructor(
    public readonly record: RelicRecord,
    public readonly template: RelicTemplate,
    public readonly affixAggregates: ReadonlyArray<AffixAggregate> = []
  ) {
    super(record, template, affixAggregates)
  }
  /**
   * 增加堆疊，返回新的遺物聚合實例
   */
  addStack(): RelicAggregate | null {
    if (this.isMaxStacks()) return null
    const newRecord: RelicRecord = {
      ...this.record,
      currentStacks: this.record.currentStacks + 1,
    }
    return new RelicAggregate(newRecord, this.template, this.affixAggregates)
  }
  /**
   * 減少堆疊，返回新的遺物聚合實例
   */
  removeStack(): RelicAggregate | null {
    if (this.record.currentStacks <= 1) return null
    const newRecord: RelicRecord = {
      ...this.record,
      currentStacks: this.record.currentStacks - 1,
    }
    return new RelicAggregate(newRecord, this.template, this.affixAggregates)
  }
  isMaxStacks(): boolean {
    return this.record.currentStacks >= this.template.maxStacks
  }
  get currentStacks(): number {
    return this.record.currentStacks
  }
  get maxStacks(): number {
    return this.template.maxStacks
  }
  get rarity(): ItemRarity {
    return this.template.rarity
  }
  get tags(): ReadonlyArray<TagType> {
    return this.template.tags
  }
  get loadCost(): number {
    return this.template.loadCost
  }
}
