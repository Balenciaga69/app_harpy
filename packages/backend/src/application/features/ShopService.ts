import { CharacterRecord } from '../../domain/character/Character'
import { ItemAggregate } from '../../domain/item/Item'
import { ApplicationErrorCode, DomainErrorCode } from '../../shared/result/ErrorCodes'
import { Result } from '../../shared/result/Result'
import { IItemGenerationService } from '../content-generation/service/item/ItemGenerationService'
import { IContextToDomainConverter } from '../core-infrastructure/context/helper/ContextToDomainConverter'
import { IContextSnapshotAccessor } from '../core-infrastructure/context/service/AppContextService'
import { IContextUnitOfWork } from '../core-infrastructure/context/service/ContextUnitOfWork'
/**
 * 商店服務介面
 * 職責：協調商店、角色、倉庫間的複雜交互
 * 邊界：確保每筆交易的原子性與一致性
 */
export interface IShopService {
  /** 購買商店中的物品，自動扣款、加入倉庫、移除商店 */
  buyItem(itemId: string): Result<void, DomainErrorCode | ApplicationErrorCode>
  /** 出售倉庫中的物品，自動增加金錢、移出倉庫 */
  sellItem(itemId: string): Result<void, DomainErrorCode | ApplicationErrorCode>
  /** 根據當前難度與配置生成新商店物品 */
  generateShopItems(): Result<void, DomainErrorCode | ApplicationErrorCode>
  /** 刷新商店，清空現有物品並生成新物品（扣除刷新費用） */
  refreshShopItems(): Result<void, DomainErrorCode | ApplicationErrorCode>
  // 取得商品清單 (透過 轉換成 view Object 等DTO)
}
/**
 * 商店服務：管理購買、出售、生成與刷新
 */
export class ShopService implements IShopService {
  constructor(
    private contextAccessor: IContextSnapshotAccessor,
    private contextToDomainConverter: IContextToDomainConverter,
    private itemGenerationService: IItemGenerationService,
    private unitOfWork: IContextUnitOfWork
  ) {}
  /** 購買 */
  buyItem(itemId: string): Result<void, DomainErrorCode | ApplicationErrorCode> {
    // 轉換 Context → Domain
    const shop = this.contextToDomainConverter.convertShopContextToDomain()
    const character = this.contextToDomainConverter.convertCharacterContextToDomain()
    const stash = this.contextToDomainConverter.convertStashContextToDomain()
    // 從商店找到指定的物品
    const shopItem = shop.items.find((item) => item.itemAggregate.record.id === itemId)
    if (!shopItem) {
      return Result.fail(DomainErrorCode.商店_商店物品不存在)
    }
    // 檢查玩家金錢是否足夠
    const goldAfterPurchase = character.record.gold - shopItem.price
    if (goldAfterPurchase < 0) {
      return Result.fail(ApplicationErrorCode.商店_金錢不足)
    }
    // 嘗試加入倉庫
    const stashResult = stash.addItem(shopItem.itemAggregate)
    if (stashResult.isFailure) {
      return Result.fail(stashResult.error as DomainErrorCode | ApplicationErrorCode)
    }
    // 從商店移除物品
    const shopResult = shop.removeItem(itemId)
    if (shopResult.isFailure) {
      return Result.fail(shopResult.error as DomainErrorCode | ApplicationErrorCode)
    }
    // 更新角色金錢記錄
    const updatedCharacterRecord: CharacterRecord = {
      ...character.record,
      gold: goldAfterPurchase,
    }
    // 使用 Unit of Work 原子提交所有變更
    this.unitOfWork
      .updateCharacterContext({
        ...this.contextAccessor.getCharacterContext(),
        ...updatedCharacterRecord,
      })
      .updateStashContext({
        ...this.contextAccessor.getStashContext(),
        items: stashResult.value!.items.map((item) => item.record),
      })
      .updateShopContext({
        ...this.contextAccessor.getShopContext(),
        items: shopResult.value!.items.map((shopAgg) => shopAgg.itemAggregate.record),
      })
      .commit()
    return Result.success(undefined)
  }
  /** 出售 */
  sellItem(itemId: string): Result<void, DomainErrorCode | ApplicationErrorCode> {
    // 轉換 Context → Domain
    const shop = this.contextToDomainConverter.convertShopContextToDomain()
    const character = this.contextToDomainConverter.convertCharacterContextToDomain()
    const stash = this.contextToDomainConverter.convertStashContextToDomain()
    // 從倉庫取出要出售的物品
    const itemToSell = stash.getItem(itemId)
    if (!itemToSell) {
      return Result.fail(DomainErrorCode.倉庫_物品不存在) // TODO: 應該用倉庫相關錯誤
    }
    // 從倉庫移除物品
    const stashRemoveResult = stash.removeItem(itemId)
    if (stashRemoveResult.isFailure) {
      return Result.fail(DomainErrorCode.商店_商店物品不存在)
    }
    // 更新角色金錢
    const updatedCharacterRecord: CharacterRecord = {
      ...character.record,
      gold: character.record.gold + shop.getSellPrice(itemToSell),
    }
    // 原子提交變更
    this.unitOfWork
      .updateCharacterContext({
        ...this.contextAccessor.getCharacterContext(),
        ...updatedCharacterRecord,
      })
      .updateStashContext({
        ...this.contextAccessor.getStashContext(),
        items: stashRemoveResult.value!.items.map((item) => item.record),
      })
      .commit()
    return Result.success(undefined)
  }
  generateShopItems(): Result<void, DomainErrorCode | ApplicationErrorCode> {
    const shop = this.contextToDomainConverter.convertShopContextToDomain()
    const start = shop.items.length
    const end = shop.config.shopSlotCount
    const items: ItemAggregate[] = []
    // 生成新物品
    for (let i = start; i < end; i++) {
      const result = this.itemGenerationService.generateRandomItem('SHOP_REFRESH')
      if (result.isFailure) {
        return Result.fail(result.error as DomainErrorCode | ApplicationErrorCode)
      }
      items.push(result.value!)
    }
    // 添加到商店
    const addResult = shop.addManyItems(items)
    if (addResult.isFailure) {
      return Result.fail(addResult.error as DomainErrorCode | ApplicationErrorCode)
    }
    // 將最稀有的第一個物品設為折扣
    const discountResult = shop.setRarestItemAsDiscount()
    if (discountResult.isFailure) {
      return Result.fail(discountResult.error as DomainErrorCode | ApplicationErrorCode)
    }
    // 更新 shopContext
    this.unitOfWork
      .updateShopContext({
        ...this.contextAccessor.getShopContext(),
        items: addResult.value!.items.map((shopAgg) => shopAgg.itemAggregate.record),
      })
      .commit()
    return Result.success(undefined)
  }
  refreshShopItems(): Result<void, DomainErrorCode | ApplicationErrorCode> {
    const shop = this.contextToDomainConverter.convertShopContextToDomain()
    const character = this.contextToDomainConverter.convertCharacterContextToDomain()
    const { difficulty } = this.contextAccessor.getCurrentAtCreatedInfo()
    const refreshCost = shop.config.baseRefreshCost * difficulty
    // 檢查金錢是否足夠
    const goldAfterRefresh = character.record.gold - refreshCost
    if (goldAfterRefresh < 0) {
      return Result.fail(ApplicationErrorCode.商店_金錢不足)
    }
    // 提交金錢變更與刷新商店
    const result = this.generateShopItems()
    if (result.isFailure) {
      return Result.fail(result.error as DomainErrorCode | ApplicationErrorCode)
    }
    // 更新角色金錢記錄
    const updatedCharacterRecord: CharacterRecord = {
      ...character.record,
      gold: goldAfterRefresh,
    }
    // 使用 Unit of Work 原子提交所有變更
    this.unitOfWork
      .updateCharacterContext({
        ...this.contextAccessor.getCharacterContext(),
        ...updatedCharacterRecord,
      })
      .commit()
    return Result.success(undefined)
  }
}
