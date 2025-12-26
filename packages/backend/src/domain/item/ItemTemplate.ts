import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'
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
  readonly stackLimit: number
}
