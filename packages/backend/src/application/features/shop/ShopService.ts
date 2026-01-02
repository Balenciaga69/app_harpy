import { CharacterRecord } from '../../../domain/character/Character'
import { ItemAggregate } from '../../../domain/item/Item'
import { ApplicationErrorCode, DomainErrorCode } from '../../../shared/result/ErrorCodes'
import { Result } from '../../../shared/result/Result'
import { IItemGenerationService } from '../../content-generation/service/item/ItemGenerationService'
import { IShopContextHandler } from './ShopContextHandler'

/**
 * 商店服務介面
 * 職責：協調商店、角色、倉庫間的複雜交互
 * 邊界：確保每筆交易的原子性與一致性
 */
export interface IShopService {
  /** 購買商店中的物品，自動扣款、加入倉庫、移除商店 */
  buyItem(itemId: string): Result<void, string>
  /** 出售倉庫中的物品，自動增加金錢、移出倉庫 */
  sellItem(itemId: string): Result<void, string>
  /** 根據當前難度與配置生成新商店物品 */
  generateShopItems(): Result<void, string>
  /** 刷新商店，清空現有物品並生成新物品（扣除刷新費用） */
  refreshShopItems(): Result<void, string>
  // 取得商品清單 (透過 轉換成 view Object 等DTO)
}
/**
 * 商店服務：管理購買、出售、生成與刷新
 */
export class ShopService implements IShopService {
  constructor(
    private itemGenerationService: IItemGenerationService,
    private ctxHandler: IShopContextHandler
  ) {}
  /** 購買 */
  buyItem(itemId: string): Result<void, string> {
    // 驗證當前 Run 狀態
    const validateResult = this.ctxHandler.validateRunStatus()
    if (validateResult.isFailure) return Result.fail(validateResult.error!)
    // 轉換 Context → Domain
    const { shop, character, stash } = this.ctxHandler.loadShopDomainContexts()
    // 從商店找到指定的物品
    const shopItemResult = shop.getItem(itemId)
    const shopItem = shopItemResult.value!
    if (shopItemResult.isFailure) return Result.fail(shopItemResult.error!)
    // 檢查玩家金錢是否足夠
    const goldAfterPurchase = character.record.gold - shopItem.record.price
    if (goldAfterPurchase < 0) return Result.fail(ApplicationErrorCode.商店_金錢不足)
    // 嘗試加入倉庫
    const stashResult = stash.addItem(shopItem.itemAggregate)
    if (stashResult.isFailure) return Result.fail(stashResult.error!)
    // 從商店移除物品
    const shopResult = shop.removeItem(itemId)
    if (shopResult.isFailure) return Result.fail(shopResult.error!)
    // 更新角色金錢記錄
    const updatedCharacterRecord: CharacterRecord = {
      ...character.record,
      gold: goldAfterPurchase,
    }
    // 使用 helper 提交交易
    this.ctxHandler.commitBuyTransaction({
      characterRecord: updatedCharacterRecord,
      shop: shopResult.value!,
      stash: stashResult.value!,
    })
    return Result.success(undefined)
  }
  /** 出售 */
  sellItem(itemId: string): Result<void, string> {
    const validateResult = this.ctxHandler.validateRunStatus()
    if (validateResult.isFailure) return Result.fail(validateResult.error!)
    // 轉換 Context → Domain
    const { shop, character, stash } = this.ctxHandler.loadShopDomainContexts()
    // 從倉庫取出要出售的物品
    const itemToSell = stash.getItem(itemId)
    if (!itemToSell) return Result.fail(DomainErrorCode.倉庫_物品不存在)
    // 從倉庫移除物品
    const stashRemoveResult = stash.removeItem(itemId)
    if (stashRemoveResult.isFailure) return Result.fail(DomainErrorCode.商店_商店物品不存在)
    // 更新角色金錢
    const updatedCharacterRecord: CharacterRecord = {
      ...character.record,
      gold: character.record.gold + shop.getSellPrice(itemToSell),
    }
    // 使用 helper 提交交易
    this.ctxHandler.commitSellTransaction({
      characterRecord: updatedCharacterRecord,
      stash: stashRemoveResult.value!,
    })
    return Result.success(undefined)
  }
  generateShopItems(): Result<void, string> {
    const { shop } = this.ctxHandler.loadShopDomainContexts()
    const start = shop.items.length
    const end = shop.config.shopSlotCount
    const items: ItemAggregate[] = []
    // 生成新物品
    for (let i = start; i < end; i++) {
      const result = this.itemGenerationService.generateRandomItemFromShop()
      if (result.isFailure) return Result.fail(result.error!)
      items.push(result.value!)
    }
    // 添加到商店
    const addResult = shop.addManyItems(items)
    if (addResult.isFailure) return Result.fail(addResult.error!)
    // 將最稀有的第一個物品設為折扣
    const discountResult = shop.setRarestItemAsDiscount()
    if (discountResult.isFailure) return Result.fail(discountResult.error!)
    // 使用 helper 提交交易
    this.ctxHandler.commitGenerateShopItemsTransaction({
      shop: addResult.value!,
    })
    return Result.success(undefined)
  }
  /** 刷新商店 */
  refreshShopItems(): Result<void, string> {
    // 驗證當前 Run 狀態
    const validateResult = this.ctxHandler.validateRunStatus()
    if (validateResult.isFailure) return Result.fail(validateResult.error!)
    // 玩家主動刷新，需扣除金錢
    const { shop, character } = this.ctxHandler.loadShopDomainContexts()
    const difficulty = this.ctxHandler.getDifficulty()
    const refreshCost = shop.config.baseRefreshCost * difficulty
    const goldAfterRefresh = character.record.gold - refreshCost
    if (goldAfterRefresh < 0) return Result.fail(ApplicationErrorCode.商店_金錢不足)
    // 執行刷新
    const result = this.refreshShopItemsBySystem()
    if (result.isFailure) return Result.fail(result.error!)
    // 更新角色金錢記錄
    const updatedCharacterRecord: CharacterRecord = {
      ...character.record,
      gold: goldAfterRefresh,
    }
    // 使用 helper 提交交易（這裡只更新 character）
    this.ctxHandler.commitSellTransaction({
      characterRecord: updatedCharacterRecord,
    })
    return Result.success(undefined)
  }
  /** 系統觸發刷新商店（不花錢） */
  refreshShopItemsBySystem(): Result<void, string> {
    // 只刷新商店內容，不動用金錢
    const result = this.generateShopItems()
    if (result.isFailure) return Result.fail(result.error!)
    return Result.success(undefined)
  }
}
