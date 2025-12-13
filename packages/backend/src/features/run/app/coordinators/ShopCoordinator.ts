import { RunContext } from '../../interfaces/run-context'
/**
 * 商店協調器
 * 封裝與 Shop 模組的互動邏輯
 */
export class ShopCoordinator {
  /**
   * 刷新商店商品
   */
  refreshShop(_context: RunContext): void {
    // TODO: 調用 Shop.refresh()
  }
  /**
   * 購買商品
   */
  purchaseItem(_context: RunContext, _itemId: string): boolean {
    // TODO: 調用 Shop.purchase()
    // 扣除金幣，加入物品到 Inventory
    return false // placeholder
  }
  /**
   * 出售物品
   */
  sellItem(_context: RunContext, _itemId: string): void {
    // TODO: 調用 Shop.sell()
    // 增加金幣
  }
  /**
   * 拉霸機賭博
   */
  gamble(_context: RunContext, _amount: number): unknown {
    // TODO: 調用 ShopGambling.play()
    return null // placeholder
  }
}
