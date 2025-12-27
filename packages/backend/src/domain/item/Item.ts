import { BaseInstanceFields, WithCreatedInfo } from '../../shared/models/BaseInstanceFields'
import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'
import { AffixRecord, AffixAggregate } from '../affix/Affix'
/** 物品稀有度等級，決定物品的品質與掉落概率 */
export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
/** 物品樣板，定義物品的靜態屬性、詞綴與標籤 */
export interface ItemTemplate {
  readonly id: string
  readonly name: I18nField
  readonly desc: I18nField
  readonly rarity: ItemRarity
  readonly affixIds: ReadonlyArray<string>
  readonly tags: ReadonlyArray<TagType>
  readonly loadCost: number
}
/** 遺物樣板，擴展物品樣板並定義最大堆疊層數 */
export interface RelicTemplate extends ItemTemplate {
  readonly maxStacks: number
}
/** 物品記錄，包含基礎欄位與詞綴資訊 */
export interface ItemRecord extends BaseInstanceFields, WithCreatedInfo {
  readonly affixRecord: ReadonlyArray<AffixRecord>
}
/** 遺物記錄，擴展物品記錄並包含當前堆疊層數 */
export interface RelicRecord extends ItemRecord {
  readonly currentStacks: number
}
export abstract class ItemAggregate {
  constructor(
    public record: ItemRecord,
    public readonly template: ItemTemplate,
    public readonly affixAggregates: ReadonlyArray<AffixAggregate> = []
  ) {}
}
/** 遺物聚合，包含遺物記錄、樣板與詞綴快照集合 */
export class RelicAggregate extends ItemAggregate {
  constructor(
    public record: RelicRecord,
    public readonly template: RelicTemplate,
    public readonly affixAggregates: ReadonlyArray<AffixAggregate> = []
  ) {
    super(record, template, affixAggregates)
  }
  isMaxStacks(): boolean {
    return this.record.currentStacks >= this.template.maxStacks
  }
  addStack(): boolean {
    if (this.isMaxStacks()) return false
    this.record = { ...this.record, currentStacks: this.record.currentStacks + 1 }
    return true
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
