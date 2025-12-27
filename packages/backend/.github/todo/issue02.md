```ts
/** 詞綴記錄，包含詞綴的基本識別資訊與創建資訊 */
export interface AffixRecord extends BaseInstanceFields, WithSourceUnit, WithCreatedInfo {}
/** 詞綴樣板，定義詞綴的靜態屬性與綁定的效果集合 */
export interface AffixTemplate {
  readonly id: string
  readonly desc: I18nField
  readonly tags: TagType[]
  readonly effectIds: string[]
}

/** 詞綴聚合，包含詞綴記錄、樣板與效果集合 */
export class AffixAggregate {
  readonly record: AffixRecord
  readonly template: AffixTemplate
  readonly effects: AffixEffect[]
  constructor(record: AffixRecord, template: AffixTemplate, effects: AffixEffect[]) {
    this.record = record
    this.template = template
    this.effects = effects
  }
}
/** 物品稀有度等級，決定物品的品質與掉落概率 */
export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
/** 物品樣板，定義物品的靜態屬性、詞綴與標籤 */
export interface ItemTemplate {
  readonly id: string
  readonly name: I18nField
  readonly desc: I18nField
  readonly rarity: ItemRarity
  readonly affixIds: string[]
  readonly tags: TagType[]
  readonly loadCost: number
}
/** 遺物樣板，擴展物品樣板並定義最大堆疊層數 */
export interface RelicTemplate extends ItemTemplate {
  readonly maxStacks: number
}
/** 物品記錄，包含基礎欄位與詞綴資訊 */
export interface ItemRecord extends BaseInstanceFields, WithCreatedInfo {
  readonly affixRecord: AffixRecord[]
}
/** 遺物記錄，擴展物品記錄並包含當前堆疊層數 */
export interface RelicRecord extends ItemRecord {
  readonly currentStacks: number
}
/** 遺物聚合，包含遺物記錄、樣板與詞綴快照集合 */
export class RelicAggregate {
  readonly record: RelicRecord
  readonly template: RelicTemplate
  readonly affixAggregates: AffixAggregate[]
  constructor(record: RelicRecord, template: RelicTemplate, affixAggregates: AffixAggregate[]) {
    this.record = record
    this.template = template
    this.affixAggregates = affixAggregates
  }
  isMaxStacks(): boolean {
    return this.record.currentStacks >= this.template.maxStacks
  }
}

export interface UltimateTemplate {
  readonly id: string
  readonly name: I18nField
  readonly desc: I18nField
  readonly tags: TagType[]
  readonly energyCost: number
  // 推薦方式：使用更細粒度的鉤子與效果配對
  readonly hooks?: { event: GameHook; effects: UltimateEffect[] }[]
  // 額外元資料，提供給引擎或外部狀態使用 (例如外部計數器鍵、紀錄鍵等)
  readonly metadata?: Record<string, unknown>
}
export interface UltimateRecord extends BaseInstanceFields, WithSourceUnit, WithCreatedInfo {
  readonly pluginIds: string[]
}

export class UltimateAggregate {
  readonly id: string
  readonly record: UltimateRecord
  readonly template: UltimateTemplate
  constructor(id: string, record: UltimateRecord, template: UltimateTemplate) {
    this.id = id
    this.record = record
    this.template = template
  }
}
/** 敵人生成信息，描述敵人出現的權重與進度約束 */
export interface EnemySpawnInfo extends TemplateWeightInfo, WithChapter {}
/** 敵人難度角色，決定敵人的詞綴與大絕招配置 */
export type EnemyRole = 'NORMAL' | 'ELITE' | 'BOSS'
/** 敵人難度配置，定義不同難度敵人的詞綴與大絕招集合 */
export interface EnemyRoleConfig {
  affixIds: string[]
  ultimateId: string
}
/** 敵人樣板，定義敵人的靜態屬性與根據難度的配置 */
export interface EnemyTemplate {
  readonly id: string
  readonly name: I18nField
  readonly desc: I18nField
  readonly roleConfigs: Record<EnemyRole, EnemyRoleConfig>
}
/** 敵人聚合，包含敵人的樣板與根據難度生成的詞綴與大絕招 */
export class EnemyAggregate {
  readonly id: string
  readonly role: EnemyRole
  readonly template: EnemyTemplate
  readonly affixes: AffixAggregate[]
  readonly ultimate: UltimateAggregate
  constructor(
    id: string,
    role: EnemyRole,
    template: EnemyTemplate,
    affixes: AffixAggregate[],
    ultimate: UltimateAggregate
  ) {
    this.id = id
    this.role = role
    this.template = template
    this.affixes = affixes
    this.ultimate = ultimate
  }
}
```
