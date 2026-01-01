import { CharacterRecordHelper } from '../../../../domain/character/Character'
import { RelicRecord } from '../../../../domain/item/Item'
import { ItemRollModifier } from '../../../../domain/item/roll/ItemRollModifier'
import { TagType } from '../../../../shared/models/TagType'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
/**
 * 物品生成相關常數
 * 集中管理所有與物品生成、骰選、修飾符相關的閾值與配置
 */
/** 高頻標籤閾值：標籤出現次數達此值時視為高頻 */
export const HIGH_FREQUENCY_TAG_THRESHOLD = 5
/** 高堆疊聖物閾值：聖物堆疊數達此值時視為高堆疊 */
export const HIGH_STACK_RELIC_THRESHOLD = 5
/** 高頻標籤修飾符乘數：高頻標籤對骰選權重的影響係數 */
export const HIGH_FREQUENCY_TAG_MULTIPLIER = 0.5
/** 高堆疊聖物修飾符乘數：高堆疊聖物對骰選權重的影響係數 */
export const HIGH_STACK_RELIC_MULTIPLIER = 0.2
/**
 * 物品修飾符聚合服務：將高頻標籤與高堆疊物品轉換為骰選修飾符
 * 職責：聚合未過期修飾符、識別高頻標籤、篩選高堆疊聖物
 * 依賴：IConfigStoreAccessor( 讀物品模板 )、IContextSnapshotAccessor( 讀角色與運行狀態 )
 * 邊界：純聚合邏輯，不修改任何狀態
 */
export interface IItemModifierAggregationService {
  /** 聚合所有適用的骰選修飾符：未過期修飾符 + 高頻標籤 + 高堆疊聖物 */
  aggregateModifiers(): ItemRollModifier[]
}
export class ItemModifierAggregationService implements IItemModifierAggregationService {
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor
  ) {}
  /**
   * 聚合所有適用的骰選修飾符：未過期修飾符 + 高頻標籤 + 高堆疊聖物
   * 副作用：無( 純聚合邏輯 )
   * 邊界：修飾符 durationStages !== 0 表示未過期
   */
  aggregateModifiers(): ItemRollModifier[] {
    const { rollModifiers } = this.contextSnapshot.getRunContext()
    return [
      //TODO: 改造成可調節變動的策略
      ...rollModifiers.filter((mod) => mod.durationStages !== 0),
      ...this.getHighFrequencyTagModifiers(),
      ...this.getHighStackRelicModifiers(),
    ]
  }
  /**
   * 統計已裝備物品標籤頻率，將高頻標籤轉換為骰選修飾符
   * 業務規則：高頻標籤增加相同標籤物品的骰選權重
   * 副作用：無
   */
  private getHighFrequencyTagModifiers(): ItemRollModifier[] {
    const tagCounts = this.countEquippedTagOccurrences()
    return Object.entries(tagCounts)
      .filter(([, count]) => count >= HIGH_FREQUENCY_TAG_THRESHOLD)
      .map(([tag]) => ({
        id: `modifier-tag-${tag}`,
        type: 'TAG' as const,
        tag: tag as TagType,
        multiplier: HIGH_FREQUENCY_TAG_MULTIPLIER,
        durationStages: 0,
      }))
  }
  /**
   * 統計已裝備聖物的標籤出現次數
   * 邊界：跳過不存在於靜態配置的樣板
   */
  private countEquippedTagOccurrences(): Partial<Record<TagType, number>> {
    const { characterContext } = this.contextSnapshot.getAllContexts()
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    // 取得已裝備聖物的樣板
    const equippedRelicIds = characterContext.relics.filter(Boolean).map((relic) => relic.templateId)
    // 取得樣板資訊
    const relicTemplates = itemStore.getManyItems(equippedRelicIds)
    // 統計標籤出現次數
    const tagCounts: Partial<Record<TagType, number>> = {}
    for (const relic of relicTemplates) {
      for (const tag of relic.tags) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1
      }
    }
    return tagCounts
  }
  /**
   * 篩選未達堆疊上限但已達閾值的聖物，轉換為骰選修飾符
   * 業務規則：高堆疊聖物增加其再獲得的骰選權重，鼓勵高層級聖物升級
   * 邊界：不包含已達堆疊上限的聖物
   * 副作用：無
   */
  private getHighStackRelicModifiers(): ItemRollModifier[] {
    const { characterContext } = this.contextSnapshot.getAllContexts()
    // 取得角色聖物堆疊數映射
    const relicStackMap = CharacterRecordHelper.getRelicStackCount({ ...characterContext })
    return (
      characterContext.relics
        // 篩選高堆疊但未達上限的聖物
        .filter((r) => this.isHighStackButNotMaxed(r, relicStackMap))
        // 轉換為骰選修飾符
        .map((r) => ({
          id: `modifier-relic-${r.templateId}`,
          type: 'ID' as const,
          templateId: r.templateId,
          multiplier: HIGH_STACK_RELIC_MULTIPLIER,
          durationStages: 0,
        }))
    )
  }
  /** 檢查聖物是否為高堆疊且未達上限 */
  private isHighStackButNotMaxed(record: RelicRecord, map: Map<string, number>): boolean {
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    const template = itemStore.getRelic(record.templateId)
    if (!template) return false
    // 檢查是否達到高堆疊閾值且未達最大堆疊
    const currentStacks = map.get(record.templateId) ?? 0
    // 當前堆疊必須大於等於閾值，且小於最大堆疊數
    return currentStacks >= HIGH_STACK_RELIC_THRESHOLD && currentStacks < template.maxStacks
  }
}
// TODO:@Copilot 策略 與 id 匹配目前直接寫死 record 在這裡就好 不用刻意動態化
