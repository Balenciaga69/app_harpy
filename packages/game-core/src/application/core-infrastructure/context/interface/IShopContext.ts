import { ShopRecord } from '../../../../domain/shop/Shop'
import { ShopConfigId } from '../../../../domain/shop/ShopConfig'
import { WithRunIdAndVersion } from './WithRunIdAndVersion'
export interface IShopContext extends WithRunIdAndVersion, ShopRecord {
  shopConfigId: ShopConfigId
}
