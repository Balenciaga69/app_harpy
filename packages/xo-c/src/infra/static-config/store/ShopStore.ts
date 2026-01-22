import { IShopStore } from '../../../application/core-infrastructure/static-config/IConfigStores'
import { ShopConfig } from '../../../domain/shop/ShopConfig'
import { ConfigNotFoundError } from '../../../shared/errors/GameErrors'
export class ShopStore implements IShopStore {
  private shopConfigs: Map<string, ShopConfig> = new Map()
  getShopConfig(id: string): ShopConfig {
    const config = this.shopConfigs.get(id)
    if (!config) {
      throw new ConfigNotFoundError('ShopConfig', id)
    }
    return config
  }
  hasShopConfig(id: string): boolean {
    return this.shopConfigs.has(id)
  }
  getAllShopConfigs(): ShopConfig[] {
    return [...this.shopConfigs.values()]
  }
  setMany(shopConfigs: ShopConfig[]): void {
    for (const config of shopConfigs) {
      this.shopConfigs.set(config.id, config)
    }
  }
}
