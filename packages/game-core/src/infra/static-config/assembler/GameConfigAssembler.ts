import {
  AffixConfigDTO,
  EnemyConfigDTO,
  IAffixConfigLoader,
  IEnemyConfigLoader,
  IItemConfigLoader,
  IProfessionConfigLoader,
  IShopConfigLoader,
  ItemConfigDTO,
  IUltimateConfigLoader,
  ProfessionConfigDTO,
  ShopConfigDTO,
  UltimateConfigDTO,
} from '../../../application/core-infrastructure/static-config/IConfigLoaders'
import { IGameConfigAssembler } from '../../../application/core-infrastructure/static-config/IGameConfigAssembler'
import { AffixStore } from '../store/AffixStore'
import { EnemyStore } from '../store/EnemyStore'
import { ItemStore } from '../store/ItemStore'
import { ProfessionStore } from '../store/ProfessionStore'
import { ShopStore } from '../store/ShopStore'
import { UltimateStore } from '../store/UltimateStore'
export class GameConfigAssembler implements IGameConfigAssembler {
  private readonly enemyConfigLoader: IEnemyConfigLoader
  private readonly itemConfigLoader: IItemConfigLoader
  private readonly professionConfigLoader: IProfessionConfigLoader
  private readonly ultimateConfigLoader: IUltimateConfigLoader
  private readonly affixConfigLoader: IAffixConfigLoader
  private readonly shopConfigLoader: IShopConfigLoader
  private readonly enemyStore: EnemyStore
  private readonly itemStore: ItemStore
  private readonly professionStore: ProfessionStore
  private readonly ultimateStore: UltimateStore
  private readonly affixStore: AffixStore
  private readonly shopStore: ShopStore
  constructor(
    enemyConfigLoader: IEnemyConfigLoader,
    itemConfigLoader: IItemConfigLoader,
    professionConfigLoader: IProfessionConfigLoader,
    ultimateConfigLoader: IUltimateConfigLoader,
    affixConfigLoader: IAffixConfigLoader,
    shopConfigLoader: IShopConfigLoader
  ) {
    this.enemyConfigLoader = enemyConfigLoader
    this.itemConfigLoader = itemConfigLoader
    this.professionConfigLoader = professionConfigLoader
    this.ultimateConfigLoader = ultimateConfigLoader
    this.affixConfigLoader = affixConfigLoader
    this.shopConfigLoader = shopConfigLoader
    this.enemyStore = new EnemyStore()
    this.itemStore = new ItemStore()
    this.professionStore = new ProfessionStore()
    this.ultimateStore = new UltimateStore()
    this.affixStore = new AffixStore()
    this.shopStore = new ShopStore()
  }
  async assembleAllConfigs(): Promise<void> {
    const [enemyConfig, itemConfig, professionConfig, ultimateConfig, affixConfig, shopConfig] = await Promise.all([
      this.enemyConfigLoader.load(),
      this.itemConfigLoader.load(),
      this.professionConfigLoader.load(),
      this.ultimateConfigLoader.load(),
      this.affixConfigLoader.load(),
      this.shopConfigLoader.load(),
    ])
    this.assembleEnemyStore(enemyConfig)
    this.assembleItemStore(itemConfig)
    this.assembleProfessionStore(professionConfig)
    this.assembleUltimateStore(ultimateConfig)
    this.assembleAffixStore(affixConfig)
    this.assembleShopStore(shopConfig)
  }
  private assembleEnemyStore(enemyConfig: EnemyConfigDTO): void {
    this.enemyStore.setMany(enemyConfig.enemyTemplates)
    this.enemyStore.setEnemySpawnInfos(enemyConfig.spawnInfos)
  }
  private assembleItemStore(itemConfig: ItemConfigDTO): void {
    this.itemStore.setMany(itemConfig.relicTemplate)
    this.itemStore.setItemRollConfigs(itemConfig.itemRollConfigs)
    this.itemStore.setRewardRollConfigs(itemConfig.rewardRollConfigs)
    this.itemStore.setItemRollConstraints(itemConfig.itemRollConstraints)
  }
  private assembleProfessionStore(professionConfig: ProfessionConfigDTO): void {
    this.professionStore.setMany(professionConfig.professionTemplates)
  }
  private assembleUltimateStore(ultimateConfig: UltimateConfigDTO): void {
    this.ultimateStore.setMany(ultimateConfig.ultimateTemplates)
  }
  private assembleAffixStore(affixConfig: AffixConfigDTO): void {
    this.affixStore.setMany(affixConfig.affixTemplates)
    this.affixStore.setAffixEffects(affixConfig.affixEffectTemplates)
  }
  private assembleShopStore(shopConfig: ShopConfigDTO): void {
    this.shopStore.setMany(shopConfig.shopConfigs)
  }
  getEnemyStore(): EnemyStore {
    return this.enemyStore
  }
  getItemStore(): ItemStore {
    return this.itemStore
  }
  getProfessionStore(): ProfessionStore {
    return this.professionStore
  }
  getUltimateStore(): UltimateStore {
    return this.ultimateStore
  }
  getAffixStore(): AffixStore {
    return this.affixStore
  }
  getShopStore(): ShopStore {
    return this.shopStore
  }
}
