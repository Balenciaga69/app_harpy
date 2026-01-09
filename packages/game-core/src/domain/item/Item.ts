import { BaseInstanceFields, WithCreatedInfo } from '../../shared/models/BaseInstanceFields'
import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'
import { AffixEntity, AffixRecord } from '../affix/Affix'
export type ItemType = 'RELIC'

export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

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

export interface RelicTemplate extends ItemTemplate {
  readonly maxStacks: number
  readonly itemType: 'RELIC'
}

export interface ItemRecord extends BaseInstanceFields, WithCreatedInfo {
  readonly affixRecords: ReadonlyArray<AffixRecord>
  readonly itemType: ItemType
}

export interface RelicRecord extends ItemRecord {
  readonly itemType: 'RELIC'
}
export interface IItemEntity {
  readonly record: ItemRecord
  readonly template: ItemTemplate
  readonly affixEntities: ReadonlyArray<AffixEntity>
}
export abstract class ItemEntity implements IItemEntity {
  constructor(
    public record: ItemRecord,
    public readonly template: ItemTemplate,
    public readonly affixEntities: ReadonlyArray<AffixEntity> = []
  ) {}

  getUnitStatModifiers() {
    return this.affixEntities.flatMap((affix) => affix.getUnitStatModifiers())
  }
}

export class RelicEntity extends ItemEntity {
  constructor(
    public readonly record: RelicRecord,
    public readonly template: RelicTemplate,
    public readonly affixEntities: ReadonlyArray<AffixEntity> = []
  ) {
    super(record, template, affixEntities)
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
