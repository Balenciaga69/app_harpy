import { Character, CharacterRecord } from '../../../domain/character/Character'
import { Shop } from '../../../domain/shop/Shop'
import { Stash } from '../../../domain/stash/Stash'
import { Result } from '../../../shared/result/Result'
import { IContextToDomainConverter } from '../../core-infrastructure/context/helper/ContextToDomainConverter'
import { IContextSnapshotAccessor } from '../../core-infrastructure/context/service/AppContextService'
import { IContextUnitOfWork } from '../../core-infrastructure/context/service/ContextUnitOfWork'
import { RunStatusGuard } from '../../core-infrastructure/run-status/RunStatusGuard'
export class ShopContextHandler implements IShopContextHandler {
  constructor(
    private contextAccessor: IContextSnapshotAccessor,
    private contextToDomainConverter: IContextToDomainConverter,
    private unitOfWork: IContextUnitOfWork
  ) {}
  public getDifficulty(): number {
    return this.contextAccessor.getCurrentAtCreatedInfo().difficulty
  }
  public loadShopDomainContexts() {
    return {
      shop: this.contextToDomainConverter.convertShopContextToDomain(),
      character: this.contextToDomainConverter.convertCharacterContextToDomain(),
      stash: this.contextToDomainConverter.convertStashContextToDomain(),
    }
  }
  public validateRunStatus() {
    const status = this.contextAccessor.getRunStatus()
    return RunStatusGuard.requireStatus(status, 'IDLE')
  }
  public commitBuyTransaction(updates: { characterRecord?: CharacterRecord; shop?: Shop; stash?: Stash }) {
    if (updates.characterRecord) {
      this.unitOfWork.patchCharacterContext({
        ...updates.characterRecord,
      })
    }
    if (updates.stash) {
      this.unitOfWork.patchStashContext({
        items: updates.stash.listItems().map((i) => i.record),
      })
    }
    if (updates.shop) {
      this.unitOfWork.patchShopContext({
        items: updates.shop.items.map((shopAgg) => shopAgg.record),
      })
    }
    this.unitOfWork.commit()
    return Result.success(undefined)
  }
  public commitSellTransaction(updates: { characterRecord?: CharacterRecord; stash?: Stash }) {
    if (updates.characterRecord) {
      this.unitOfWork.patchCharacterContext({
        ...updates.characterRecord,
      })
    }
    if (updates.stash) {
      this.unitOfWork.patchStashContext({
        items: updates.stash.listItems().map((i) => i.record),
      })
    }
    this.unitOfWork.commit()
    return Result.success(undefined)
  }
  public commitGenerateShopItemsTransaction(updates: { shop: Shop }) {
    this.unitOfWork.patchShopContext({
      items: updates.shop.items.map((shopAgg) => shopAgg.record),
    })
    this.unitOfWork.commit()
    return Result.success(undefined)
  }
}
export interface IShopContextHandler {
  loadShopDomainContexts(): {
    shop: Shop
    character: Character
    stash: Stash
  }
  getDifficulty(): number
  validateRunStatus(): Result<void, string>
  commitBuyTransaction(updates: { characterRecord?: CharacterRecord; shop?: Shop; stash?: Stash }): Result<void>
  commitSellTransaction(updates: { characterRecord?: CharacterRecord; stash?: Stash }): Result<void>
  commitGenerateShopItemsTransaction(updates: { shop: Shop }): Result<void>
}
