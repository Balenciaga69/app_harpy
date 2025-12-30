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
 * 遊戲配置組裝器：協調所有配置加載器，將 assemble 存儲
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
  /** 敵人 assemble 敵人 store */
  private assembleEnemyStore(enemyConfig: EnemyConfigDTO): void {
    this.enemyStore.setMany(enemyConfig.enemyTemplates)
    this.enemyStore.setEnemySpawnInfos(enemyConfig.spawnInfos)
  }
  /** 物品 assemble 物品 store */
  private assembleItemStore(itemConfig: ItemConfigDTO): void {
    this.itemStore.setMany(itemConfig.relicTemplate)
    this.itemStore.setItemRollConfigs(itemConfig.itemRollConfigs)
    this.itemStore.setItemRollConstraints(itemConfig.itemRollConstraints)
  }
  /** 職業 assemble 職業 store */
  private assembleProfessionStore(professionConfig: ProfessionConfigDTO): void {
    this.professionStore.setMany(professionConfig.professionTemplates)
  }
  /** 大絕招 assemble 大絕招 store */
  private assembleUltimateStore(ultimateConfig: UltimateConfigDTO): void {
    this.ultimateStore.setMany(ultimateConfig.ultimateTemplates)
  }
  /** 詞綴 assemble 詞綴 store */
  private assembleAffixStore(affixConfig: AffixConfigDTO): void {
    this.affixStore.setMany(affixConfig.affixTemplates)
    this.affixStore.setAffixEffects(affixConfig.affixEffectTemplates)
  }
  /** 取得敵人 store */
  getEnemyStore(): EnemyStore {
    return this.enemyStore
  }
  /** 取得物品 store */
  getItemStore(): ItemStore {
    return this.itemStore
  }
  /** 取得職業 store */
  getProfessionStore(): ProfessionStore {
    return this.professionStore
  }
  /** 取得大絕招 store */
  getUltimateStore(): UltimateStore {
    return this.ultimateStore
  }
  /** 取得詞綴 store */
  getAffixStore(): AffixStore {
    return this.affixStore
  }
}
