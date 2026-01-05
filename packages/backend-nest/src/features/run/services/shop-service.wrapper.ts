import { Injectable } from '@nestjs/common'
import { ShopService } from '../../../from-game-core'
/**
 * ShopService 包裝器
 * 用途：為 RunService 提供 game-core 的 ShopService 介面
 * 設計：NestJS 負責通過工廠函數實例化 ShopService
 * 優點：避免在業務層手動 new，依賴注入由框架管理
 */
@Injectable()
export class ShopServiceWrapper {
  constructor(private readonly shopService: ShopService) {}
  /**
   * 購買物品
   */
  buyItem(itemId: string) {
    return this.shopService.buyItem(itemId)
  }
  /**
   * 賣出物品
   */
  sellItem(itemId: string) {
    return this.shopService.sellItem(itemId)
  }
  /**
   * 刷新商店物品
   */
  refreshShopItems() {
    return this.shopService.refreshShopItems()
  }
}
