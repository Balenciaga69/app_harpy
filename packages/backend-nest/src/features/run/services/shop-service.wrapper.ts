import { Injectable } from '@nestjs/common'
import { ShopService } from '../../../from-game-core'
@Injectable()
export class ShopServiceWrapper {
  constructor(private readonly shopService: ShopService) {}
  buyItem(itemId: string) {
    return this.shopService.buyItem(itemId)
  }
  sellItem(itemId: string) {
    return this.shopService.sellItem(itemId)
  }
  refreshShopItems() {
    return this.shopService.refreshShopItems()
  }
}
