import { ItemEntity } from '../../../domain/item/Item'
import { DomainErrorCode } from '../../../shared/result/ErrorCodes'
import { Result } from '../../../shared/result/Result'
import { IItemGenerationService } from '../../content-generation/service/item/ItemGenerationService'
import { IShopContextHandler } from './ShopContextHandler'
export interface IShopService {
  buyItem(itemId: string): Result<void, string>
  sellItem(itemId: string): Result<void, string>
  generateShopItems(): Result<void, string>
  refreshShopItems(): Result<void, string>
}
export class ShopService implements IShopService {
  constructor(
    private itemGenerationService: IItemGenerationService,
    private contextHandler: IShopContextHandler
  ) {}
  buyItem(itemId: string): Result<void, string> {
    const validateResult = this.ctxHandler.validateRunStatus()
    if (validateResult.isFailure) return Result.fail(validateResult.error!)
    const { shop, character, stash } = this.ctxHandler.loadShopDomainContexts()
    const shopItemResult = shop.getItem(itemId)
    const shopItem = shopItemResult.value!
    if (shopItemResult.isFailure) return Result.fail(shopItemResult.error!)
    const deductResult = character.deductGold(shopItem.record.price)
    if (deductResult.isFailure) return Result.fail(deductResult.error!)
    const stashResult = stash.addItem(shopItem.itemEntity)
    if (stashResult.isFailure) return Result.fail(stashResult.error!)
    const shopResult = shop.removeItem(itemId)
    if (shopResult.isFailure) return Result.fail(shopResult.error!)
    this.ctxHandler.commitBuyTransaction({
      characterRecord: deductResult.value!.record,
      shop: shopResult.value!,
      stash: stashResult.value!,
    })
    return Result.success()
  }
  sellItem(itemId: string): Result<void, string> {
    const validateResult = this.ctxHandler.validateRunStatus()
    if (validateResult.isFailure) return Result.fail(validateResult.error!)
    const { shop, character, stash } = this.ctxHandler.loadShopDomainContexts()
    const itemToSell = stash.getItem(itemId)
    if (!itemToSell) return Result.fail(DomainErrorCode.倉庫_物品不存在)
    const stashRemoveResult = stash.removeItem(itemId)
    if (stashRemoveResult.isFailure) return Result.fail(stashRemoveResult.error!)
    const addResult = character.addGold(shop.getSellPrice(itemToSell))
    this.ctxHandler.commitSellTransaction({
      characterRecord: addResult.value!.record,
      stash: stashRemoveResult.value!,
    })
    return Result.success()
  }
  generateShopItems(): Result<void, string> {
    const { shop } = this.ctxHandler.loadShopDomainContexts()
    const start = shop.items.length
    const end = shop.config.shopSlotCount
    const items: ItemEntity[] = []
    for (let index = start; index < end; index++) {
      const result = this.itemGenerationService.generateRandomItemFromShop()
      if (result.isFailure) return Result.fail(result.error!)
      items.push(result.value!)
    }
    const addResult = shop.addManyItems(items)
    if (addResult.isFailure) return Result.fail(addResult.error!)
    const addedShop = addResult.value!
    const discountResult = addedShop.setRarestItemAsDiscount()
    if (discountResult.isFailure) return Result.fail(discountResult.error!)
    this.ctxHandler.commitGenerateShopItemsTransaction({
      shop: addedShop,
    })
    return Result.success()
  }
  refreshShopItems(): Result<void, string> {
    const validateResult = this.ctxHandler.validateRunStatus()
    if (validateResult.isFailure) return Result.fail(validateResult.error!)
    const { shop, character } = this.ctxHandler.loadShopDomainContexts()
    const difficulty = this.ctxHandler.getDifficulty()
    const refreshCost = shop.config.baseRefreshCost * difficulty
    const deductResult = character.deductGold(refreshCost)
    if (deductResult.isFailure) return Result.fail(deductResult.error!)
    const result = this.refreshShopItemsBySystem()
    if (result.isFailure) return Result.fail(result.error!)
    this.ctxHandler.commitSellTransaction({
      characterRecord: deductResult.value!.record,
    })
    return Result.success()
  }
  refreshShopItemsBySystem(): Result<void, string> {
    const result = this.generateShopItems()
    if (result.isFailure) return Result.fail(result.error!)
    return Result.success()
  }
}
