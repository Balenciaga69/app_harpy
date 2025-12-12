/**
 * ItemGenerator
 *
 * 物品生成協調器。
 * 負責調用子生成器以生成完整物品。
 */
import { EquipmentGenerator } from './generators/EquipmentGenerator'
import { RelicGenerator } from './generators/RelicGenerator'
// import { AffixGenerator } from './generators/AffixGenerator'
import type { IEquipmentInstance, IRelicInstance } from '@/domain/item'
import type { IAffixFilter } from './strategies'
import { SlotBasedFilter } from './strategies'
import { ItemDefinitionRegistry, AffixDefinitionRegistry } from '@/domain/item'
/**
 * ItemGenerator 配置
 */
export interface IItemGeneratorConfig {
  /** 詞綴過濾策略（預設使用 SlotBasedFilter） */
  affixFilter?: IAffixFilter
  /** 物品註冊表（可選，用於測試） */
  itemRegistry?: ItemDefinitionRegistry
  /** 詞綴註冊表（可選，用於測試） */
  affixRegistry?: AffixDefinitionRegistry
}
/**
 * ItemGenerator 核心類別
 */
export class ItemGenerator {
  private readonly equipmentGen: EquipmentGenerator
  private readonly relicGen: RelicGenerator
  // private readonly affixGen: AffixGenerator
  constructor(config: IItemGeneratorConfig = {}) {
    const affixFilter = config.affixFilter ?? new SlotBasedFilter()
    const itemRegistry = config.itemRegistry ?? new ItemDefinitionRegistry()
    const affixRegistry = config.affixRegistry ?? new AffixDefinitionRegistry()
    this.equipmentGen = new EquipmentGenerator({
      affixFilter,
      itemRegistry,
      affixRegistry,
    })
    this.relicGen = new RelicGenerator({
      itemRegistry,
    })
    // this.affixGen = new AffixGenerator({
    //   filter: affixFilter,
    // })
  }
  /**
   * 生成裝備實例
   */
  generateEquipment(definitionId: string, difficulty: number, seed: string): IEquipmentInstance {
    return this.equipmentGen.generateEquipment(definitionId, difficulty, seed)
  }
  /**
   * 生成遺物實例
   */
  generateRelic(definitionId: string): IRelicInstance {
    return this.relicGen.generateRelic(definitionId)
  }
}
