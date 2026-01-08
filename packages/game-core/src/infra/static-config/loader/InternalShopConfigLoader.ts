import { IShopConfigLoader,ShopConfigDTO } from '../../../application/core-infrastructure/static-config/IConfigLoaders'
import { ShopConfigList } from '../../../data/shop/shop-config.data'
export class InternalShopConfigLoader implements IShopConfigLoader {
  async load(): Promise<ShopConfigDTO> {
    const dto: ShopConfigDTO = {
      shopConfigs: ShopConfigList,
    }
    return Promise.resolve(dto)
  }
}
