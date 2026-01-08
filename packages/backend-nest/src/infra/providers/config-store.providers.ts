import {
  GameConfigAssembler,
  InternalEnemyConfigLoader,
  InternalItemConfigLoader,
  InternalProfessionConfigLoader,
  InternalUltimateConfigLoader,
  InternalAffixConfigLoader,
  InternalShopConfigLoader,
} from 'src/from-game-core'
/**
 * 配置存儲提供者
 * 職責：組裝和提供全局遊戲配置
 * - 敵人配置存儲
 * - 物品配置存儲
 * - 職業配置存儲
 * - 終極技能配置存儲
 * - 詞綴配置存儲
 * - 商店配置存儲
 *
 * 層級：infra（技術實現層）
 * 原因：配置加載是技術細節，屬於初始化和基礎設施部分
 */
export const configStoreProviders = [
  {
    provide: 'CONFIG_STORE',
    useFactory: async () => {
      const assembler = new GameConfigAssembler(
        new InternalEnemyConfigLoader(),
        new InternalItemConfigLoader(),
        new InternalProfessionConfigLoader(),
        new InternalUltimateConfigLoader(),
        new InternalAffixConfigLoader(),
        new InternalShopConfigLoader()
      )
      await assembler.assembleAllConfigs()
      return {
        enemyStore: assembler.getEnemyStore(),
        itemStore: assembler.getItemStore(),
        professionStore: assembler.getProfessionStore(),
        ultimateStore: assembler.getUltimateStore(),
        affixStore: assembler.getAffixStore(),
        shopStore: assembler.getShopStore(),
      }
    },
  },
]
