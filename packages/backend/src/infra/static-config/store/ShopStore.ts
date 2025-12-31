import { IShopStore } from '../../../application/core-infrastructure/static-config/IConfigStores'
import { ShopConfig } from '../../../domain/shop/ShopConfig'
import { ConfigNotFoundError } from '../../../shared/errors/GameErrors'
/** 商店配置存儲：管理商店配置樣板 */
export class ShopStore implements IShopStore {
  private shopConfigs: Map<string, ShopConfig> = new Map()
  /** 根據 ID 查詢商店配置 */
  getShopConfig(id: string): ShopConfig {
    const config = this.shopConfigs.get(id)
    if (!config) {
      throw new ConfigNotFoundError('ShopConfig', id)
    }
    return config
  }
  /** 檢查商店配置是否存在 */
  hasShopConfig(id: string): boolean {
    return this.shopConfigs.has(id)
  }
  /** 取得所有商店配置 */
  getAllShopConfigs(): ShopConfig[] {
    return Array.from(this.shopConfigs.values())
  }
  /** 批量設定商店配置 */
  setMany(shopConfigs: ShopConfig[]): void {
    for (const config of shopConfigs) {
      this.shopConfigs.set(config.id, config)
    }
  }
}
