import { ItemRarity, ItemTemplate } from '../../../../domain/item/Item'
import { ItemRollConfig, ItemRollSourceType, ItemRollType } from '../../../../domain/item/roll/ItemRollConfig'
import { ItemRollModifier } from '../../../../domain/item/roll/ItemRollModifier'
import { DifficultyHelper } from '../../../../shared/helpers/DifficultyHelper'
import { WeightRoller } from '../../../../shared/helpers/WeightRoller'
import { TagStatistics } from '../../helper/TagStatistics'
import { IAppContext } from '../../../core-infrastructure/context/interface/IAppContext'
import { IAppContextService } from '../../../core-infrastructure/context/service/AppContextService'
import { RelicRecordFactory } from '../../factory/RelicFactory'
import { AffixRecordFactory } from '../../factory/AffixFactory'
/**
 * 物品生成服務：協調物品生成完整流程
 * 流程：約束驗證 → 修飾符聚合 → 權重骰選 → 實例化
 * 職責：協調各個子服務，對外暴露簡潔的生成介面
 */
export class ItemGenerationService {
  private constraintService: ItemConstraintService
  private modifierService: ItemModifierAggregationService
  private rollService: ItemRollService
  private instantiationService: ItemInstantiationService
  constructor(private appContextService: IAppContextService) {
    this.constraintService = new ItemConstraintService(appContextService)
    this.modifierService = new ItemModifierAggregationService(appContextService)
    this.rollService = new ItemRollService(appContextService, this.constraintService)
    this.instantiationService = new ItemInstantiationService(appContextService)
  }
  /**
   * 根據來源與當前修飾符生成隨機物品
   * 邊界：來源必須有效，修飾符不得為空(使用當前聚合修飾符)
   * 副作用：無狀態修改(實例化在記憶體中)
   */
  generateRandomItem(source: ItemRollSourceType) {
    if (!this.constraintService.canGenerateItems()) {
      return null
    }
    const modifiers = this.modifierService.aggregateModifiers()
    const { itemTemplateId, itemType } = this.rollService.rollItem(source, modifiers)
    return this.instantiationService.createItemAggregate(itemTemplateId, itemType)
  }
  /**
   * 生成指定樣板的物品，跳過骰選步驟
   * 邊界：樣板必須符合當前進度的限制條件
   * 副作用：無
   */
  generateItemFromTemplate(templateId: string, itemType: 'RELIC') {
    if (!this.constraintService.canGenerateItemTemplate(templateId)) {
      return null
    }
    return this.instantiationService.createItemAggregate(templateId, itemType)
  }
}
/**
 * 物品約束驗證服務：驗證物品生成是否符合章節、職業、事件等限制條件
 * 職責：生成權限檢查、樣板可用性驗證、符合限制的樣板篩選
 */
export class ItemConstraintService {
  constructor(private appContextService: IAppContextService) {}
  /**
   * 檢查目前是否可以生成物品
   * 邊界條件：未來可能加入物品池滿等限制
   * 副作用：無
   */
  canGenerateItems(): boolean {
    // TODO: 未來可能有其他限制條件(如物品池已滿)
    return true
  }
  /**
   * 檢查特定物品樣板是否符合當前進度的所有限制條件
   * 邊界：檢查章節、職業、事件、敵人等限制
   * 副作用：無
   */
  canGenerateItemTemplate(templateId: string): boolean {
    const contexts = this.appContextService.GetContexts()
    const config = this.appContextService.GetConfig()
    const characterContext = contexts.characterContext
    const runContext = contexts.runContext
    const itemStore = config.itemStore
    const template = itemStore.getRelic(templateId)
    if (!template) return false
    const constraint = itemStore.getItemRollConstraint(templateId)
    if (!constraint) return true
    if (constraint.chapters && !constraint.chapters.includes(runContext.currentChapter)) {
      return false
    }
    if (constraint.professionIds && !constraint.professionIds.includes(characterContext.professionId)) {
      return false
    }
    if (
      (constraint.eventIds && constraint.eventIds.length > 0) ||
      (constraint.enemyIds && constraint.enemyIds.length > 0)
    ) {
      return false
    }
    return true
  }
  /**
   * 根據物品類型與稀有度取得符合當前限制條件的可用樣板清單
   * 邊界：只支援聖物類型，其他類型返回空陣列
   * 副作用：無
   */
  getAvailableTemplates(itemType: ItemRollType, rarity: ItemRarity): ItemTemplate[] {
    const config = this.appContextService.GetConfig()
    if (itemType === 'RELIC') {
      return config.itemStore
        .getAllRelics()
        .filter((item: ItemTemplate) => item.rarity === rarity && this.canGenerateItemTemplate(item.id))
    }
    return []
  }
}
/**
 * 物品實例化服務：根據當前進度背景創建物品實例
 * 職責：難度計算、樣板驗證、實例化工廠調用
 */
export class ItemInstantiationService {
  constructor(private appContextService: IAppContextService) {}
  /**
   * 根據樣板與類型創建物品實例，自動計算難度因子
   * 邊界：
   *   - 目前只支援聖物類型，其他類型拋錯
   *   - 樣板必須存在，否則拋錯
   * 副作用：無(實例化在記憶體中)
   */
  createItemAggregate(templateId: string, itemType: ItemRollType) {
    const contexts = this.appContextService.GetContexts()
    const config = this.appContextService.GetConfig()
    const characterContext = contexts.characterContext
    const runContext = contexts.runContext
    const itemStore = config.itemStore
    const { currentChapter, currentStage } = runContext
    if (itemType !== 'RELIC') throw new Error('TODO: 拋領域錯誤,暫時沒有其他類型')
    const template = itemStore.getRelic(templateId)
    if (!template) throw new Error('TODO: 拋領域錯誤')
    const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
    const atCreated = { chapter: currentChapter, stage: currentStage, difficulty }
    const affixRecords = new AffixRecordFactory().createManyRecords([...template.affixIds], {
      atCreated,
      difficulty,
      sourceUnitId: characterContext.id,
    })
    return new RelicRecordFactory().createRecord(template.id, {
      affixRecords: affixRecords,
      currentStacks: 0,
      difficulty,
      sourceUnitId: characterContext.id,
      atCreated,
    })
  }
}
/**
 * 物品修飾符聚合服務：將高頻標籤與高堆疊物品轉換為骰選修飾符
 * 職責：聚合未過期修飾符、識別高頻標籤、篩選高堆疊聖物
 * 邊界：標籤與堆疊計數閾值為常數 5
 */
export class ItemModifierAggregationService {
  constructor(private appContextService: IAppContextService) {}
  /**
   * 聚合所有適用的骰選修飾符：未過期修飾符 + 高頻標籤 + 高堆疊聖物
   * 副作用：無(純聚合邏輯)
   * 邊界：修飾符 durationStages > 0 表示未過期
   */
  aggregateModifiers(): ItemRollModifier[] {
    const runCtx = this.appContextService.GetContexts().runContext
    const nextRollModifiers = [
      ...runCtx.rollModifiers.filter((mod: ItemRollModifier) => mod.durationStages !== 0),
      ...this.getHighFrequencyTagModifiers(),
      ...this.getHighStackRelicModifiers(),
    ]
    return nextRollModifiers
  }
  /**
   * 統計已裝備物品標籤頻率，將高頻標籤(計數 >= 5)轉換為骰選修飾符
   * 業務規則：高頻標籤增加相同標籤物品的骰選權重 (乘數 0.5)
   * 副作用：無
   */
  private getHighFrequencyTagModifiers(): ItemRollModifier[] {
    const threshold = 5
    const appCtx = {
      contexts: this.appContextService.GetContexts(),
      configStore: this.appContextService.GetConfig(),
    } as IAppContext
    const equippedTags = TagStatistics.countEquippedTags(appCtx).toList()
    const highFreqTags = equippedTags.filter((t) => t.count >= threshold).map((t) => t.tag)
    return highFreqTags.map((tag) => ({
      id: `modifier-tag-${tag}`,
      type: 'TAG',
      tag,
      multiplier: 0.5,
      durationStages: 0,
    }))
  }
  /**
   * 篩選未達堆疊上限但已達閾值(計數 >= 5)的聖物，轉換為骰選修飾符
   * 業務規則：高堆疊聖物增加其再獲得的骰選權重，鼓勵高層級聖物升級
   * 邊界：不包含已達堆疊上限的聖物
   * 副作用：無
   */
  private getHighStackRelicModifiers(): ItemRollModifier[] {
    const contexts = this.appContextService.GetContexts()
    const config = this.appContextService.GetConfig()
    const characterContext = contexts.characterContext
    const itemStore = config.itemStore
    const relics = characterContext.relics
    const threshold = 5
    const highStackRelics = relics.filter((r) => {
      const isHighStack = r.currentStacks >= threshold
      const relicTemplate = itemStore.getRelic(r.templateId)
      const notAtMax = relicTemplate ? r.currentStacks < relicTemplate.maxStacks : false
      return isHighStack && notAtMax
    })
    return highStackRelics.map((r) => ({
      id: `modifier-relic-${r.templateId}`,
      type: 'ID',
      templateId: r.templateId,
      multiplier: 0.2,
      durationStages: 0,
    }))
  }
}
/**
 * 物品骰選服務：執行物品骰選流程
 * 流程：骰選類型 → 骰選稀有度 → 篩選符合條件的樣板 → 骰選樣板
 */
export class ItemRollService {
  constructor(
    private appContextService: IAppContextService,
    private constraintService: ItemConstraintService
  ) {}
  /**
   * 按順序骰選物品類型、稀有度，最後從符合限制的樣板中骰選
   * 邊界：來源配置必須存在，否則拋錯
   * 副作用：無(純骰選邏輯)
   */
  rollItem(
    source: string,
    modifiers: ItemRollModifier[]
  ): { itemTemplateId: string; itemType: ItemRollType; rarity: ItemRarity } {
    const contexts = this.appContextService.GetContexts()
    const config = this.appContextService.GetConfig()
    const runContext = contexts.runContext
    const itemStore = config.itemStore
    const staticRollConfig = itemStore.getItemRollConfig(source)
    if (!staticRollConfig) throw new Error('TODO: 拋領域錯誤')
    const itemType = rollItemType(runContext.seed, staticRollConfig)
    const rarity = rollItemRarity(runContext.seed, staticRollConfig, modifiers)
    const availableTemplates = this.constraintService.getAvailableTemplates(itemType, rarity)
    const itemTemplateId = rollItemTemplate(runContext.seed, availableTemplates)
    return { itemTemplateId, itemType, rarity }
  }
}
//=== 骰選幫助類 ===
/** 根據配置權重骰選物品類型 */
export const rollItemType = (seed: number, rollConfig: ItemRollConfig): ItemRollType => {
  const itemTypeWeightList = Object.entries(rollConfig.itemTypeWeights).map(([itemType, weight]) => ({
    id: itemType as ItemRollType,
    weight,
  }))
  return WeightRoller.roll<ItemRollType>(seed, itemTypeWeightList)
}
/** 根據修飾符調整權重後骰選稀有度，修飾符會乘算基礎權重 */
export const rollItemRarity = (seed: number, rollConfig: ItemRollConfig, modifiers: ItemRollModifier[]): ItemRarity => {
  const rarityModifiers = modifiers.filter((mod) => mod.type === 'RARITY')
  const aggregatedMods = new Map<ItemRarity, number>()
  for (const mod of rarityModifiers) {
    aggregatedMods.set(mod.rarity, (aggregatedMods.get(mod.rarity) ?? 1) + mod.multiplier)
  }
  const rarityWeightList = Object.entries(rollConfig.rarityWeights).map(([rarity, weight]) => ({
    id: rarity as ItemRarity,
    weight: weight * (aggregatedMods.get(rarity as ItemRarity) ?? 1),
  }))
  return WeightRoller.roll<ItemRarity>(seed, rarityWeightList)
}
/** 從可用樣板清單中骰選物品樣板，目前所有樣板權重均等 */
export const rollItemTemplate = (seed: number, templates: ItemTemplate[]): string => {
  const templateWeightList = templates.map((template) => ({
    id: template.id,
    weight: 1, // TODO: 未來可能會有不同權重
  }))
  return WeightRoller.roll<string>(seed, templateWeightList)
}
