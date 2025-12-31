import { ShopRecord } from '../../../../domain/shop/Shop'
import { ShopConfigId } from '../../../../domain/shop/ShopConfig'
import { WithRunIdAndVersion } from './WithRunIdAndVersion'
/**
 * 商店上下文介面
 * 職責：定義商店的運行時狀態
 * 邊界：包含商店物品、刷新次數等狀態資訊
 */
export interface IShopContext extends WithRunIdAndVersion, ShopRecord {
  /** 商店配置ID */
  shopConfigId: ShopConfigId
}
