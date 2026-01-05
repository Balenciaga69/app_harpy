import { Injectable } from '@nestjs/common'
import { ItemGenerationService } from '../../../infra/services/ItemGenerationService'
import { ShopContextHandler } from '../../../infra/services/ShopContextHandler'
import { ShopService } from '../../../from-game-core'
/**
 * ShopService 包裝器
 * 用途：將 game-core 的 ShopService 包裝為 NestJS Injectable 服務
 * 優點：統一 DI，避免重複 new，保持代碼乾淨
 */
@Injectable()
export class ShopServiceWrapper {
  private shopService: ShopService
  constructor(
    private readonly itemGenService: ItemGenerationService,
    private readonly shopContextHandler: ShopContextHandler
  ) {
    // 在構造時建立一次實例，避免每次方法調用都 new
    this.shopService = new ShopService(this.itemGenService as any, this.shopContextHandler as any)
  }
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
