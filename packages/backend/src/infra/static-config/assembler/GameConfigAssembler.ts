import { IGameConfigAssembler } from '../../../application/core-infrastructure/static-config/IGameConfigAssembler'
import {
  IEnemyConfigLoader,
  IItemConfigLoader,
  IProfessionConfigLoader,
  IUltimateConfigLoader,
  IAffixConfigLoader,
  EnemyConfigDTO,
  ItemConfigDTO,
  ProfessionConfigDTO,
  UltimateConfigDTO,
  AffixConfigDTO,
} from '../../../application/core-infrastructure/static-config/IConfigLoaders'
import { AffixStore } from '../store/AffixStore'
import { EnemyStore } from '../store/EnemyStore'
import { ItemStore } from '../store/ItemStore'
import { ProfessionStore } from '../store/ProfessionStore'
import { UltimateStore } from '../store/UltimateStore'

/**
 * 遊戲配置組裝器：協調所有配置加載器，將配置轉換為存儲
 * 職責：並行加載所有配置、轉換為內部存儲、管理存儲實例生命週期
 */
export class GameConfigAssembler implements IGameConfigAssembler {
  private readonly enemyConfigLoader: IEnemyConfigLoader
  private readonly itemConfigLoader: IItemConfigLoader
  private readonly professionConfigLoader: IProfessionConfigLoader
  private readonly ultimateConfigLoader: IUltimateConfigLoader
  private readonly affixConfigLoader: IAffixConfigLoader
  private readonly enemyStore: EnemyStore
  private readonly itemStore: ItemStore
  private readonly professionStore: ProfessionStore
  private readonly ultimateStore: UltimateStore
  private readonly affixStore: AffixStore
  constructor(
    enemyConfigLoader: IEnemyConfigLoader,
    itemConfigLoader: IItemConfigLoader,
    professionConfigLoader: IProfessionConfigLoader,
    ultimateConfigLoader: IUltimateConfigLoader,
    affixConfigLoader: IAffixConfigLoader
  ) {
    this.enemyConfigLoader = enemyConfigLoader
    this.itemConfigLoader = itemConfigLoader
    this.professionConfigLoader = professionConfigLoader
    this.ultimateConfigLoader = ultimateConfigLoader
    this.affixConfigLoader = affixConfigLoader
    this.enemyStore = new EnemyStore()
    this.itemStore = new ItemStore()
    this.professionStore = new ProfessionStore()
    this.ultimateStore = new UltimateStore()
    this.affixStore = new AffixStore()
  }
  /**
   * 並行加載所有配置，然後轉換為內部存儲
   * 副作用：初始化所有配置存儲
   * 邊界：所有加載器必須有效，加載失敗則拋錯
   */
  async assembleAllConfigs(): Promise<void> {
    const [enemyConfig, itemConfig, professionConfig, ultimateConfig, affixConfig] = await Promise.all([
      this.enemyConfigLoader.load(),
      this.itemConfigLoader.load(),
      this.professionConfigLoader.load(),
      this.ultimateConfigLoader.load(),
      this.affixConfigLoader.load(),
    ])
    this.assembleEnemyStore(enemyConfig)
    this.assembleItemStore(itemConfig)
    this.assembleProfessionStore(professionConfig)
    this.assembleUltimateStore(ultimateConfig)
    this.assembleAffixStore(affixConfig)
  }
  /** 敵人配置轉換為敵人存儲 */
  private assembleEnemyStore(enemyConfig: EnemyConfigDTO): void {
    this.enemyStore.setMany(enemyConfig.enemyTemplates)
    this.enemyStore.setEnemySpawnInfos(enemyConfig.spawnInfos)
  }
  /** 物品配置轉換為物品存儲 */
  private assembleItemStore(itemConfig: ItemConfigDTO): void {
    this.itemStore.setMany(itemConfig.relicTemplate)
    this.itemStore.setItemRollConfigs(itemConfig.itemRollConfigs)
    this.itemStore.setItemRollConstraints(itemConfig.itemRollConstraints)
  }
  /** 職業配置轉換為職業存儲 */
  private assembleProfessionStore(professionConfig: ProfessionConfigDTO): void {
    this.professionStore.setMany(professionConfig.professionTemplates)
  }
  /** 大絕招配置轉換為大絕招存儲 */
  private assembleUltimateStore(ultimateConfig: UltimateConfigDTO): void {
    this.ultimateStore.setMany(ultimateConfig.ultimateTemplates)
  }
  /** 詞綴配置轉換為詞綴存儲 */
  private assembleAffixStore(affixConfig: AffixConfigDTO): void {
    this.affixStore.setMany(affixConfig.affixTemplates)
    this.affixStore.setAffixEffects(affixConfig.affixEffectTemplates)
  }
  /** 取得敵人存儲 */
  getEnemyStore(): EnemyStore {
    return this.enemyStore
  }
  /** 取得物品存儲 */
  getItemStore(): ItemStore {
    return this.itemStore
  }
  /** 取得職業存儲 */
  getProfessionStore(): ProfessionStore {
    return this.professionStore
  }
  /** 取得大絕招存儲 */
  getUltimateStore(): UltimateStore {
    return this.ultimateStore
  }
  /** 取得詞綴存儲 */
  getAffixStore(): AffixStore {
    return this.affixStore
  }
}
