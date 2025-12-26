import { EnemyStore } from '../store/EnemyStore'
import { ItemStore } from '../store/ItemStore'
import { AffixStore } from '../store/AffixStore'
import { UltimateStore } from '../store/UltimateStore'
import { ProfessionStore } from '../store/ProfessionStore'
import { IGameConfigAssembler } from './IGameConfigAssembler'
import { IEnemyConfigLoader } from '../loader/IEnemyConfigLoader'
import { IItemConfigLoader } from '../loader/IItemConfigLoader'
import { IAffixConfigLoader } from '../loader/IAffixConfigLoader'
import { IUltimateConfigLoader } from '../loader/IUltimateConfigLoader'
import { IProfessionConfigLoader } from '../loader/IProfessionConfigLoader'
import { EnemyConfigDTO } from '../loader/IEnemyConfigLoader'
import { ItemConfigDTO } from '../loader/IItemConfigLoader'
import { AffixConfigDTO } from '../loader/IAffixConfigLoader'
import { UltimateConfigDTO } from '../loader/IUltimateConfigLoader'
import { ProfessionConfigDTO } from '../loader/IProfessionConfigLoader'
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
  private assembleEnemyStore(enemyConfig: EnemyConfigDTO): void {
    this.enemyStore.setMany(enemyConfig.enemyTemplates)
    this.enemyStore.setEnemySpawnInfos(enemyConfig.spawnInfos)
  }
  private assembleItemStore(itemConfig: ItemConfigDTO): void {
    this.itemStore.setMany(itemConfig.relicTemplate)
    this.itemStore.setItemRollConfigs(itemConfig.itemRollConfigs)
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
}
