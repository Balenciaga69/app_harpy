import { ItemInstance } from '../../../domain/item/itemInstance'
import { IStash, Stash } from '../../../domain/stash/Stash'
import { IStashContext } from '../../core-infrastructure/context/interface/IStashContext'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'
import {
  IStashContextRepository,
  ICharacterContextRepository,
} from '../../core-infrastructure/repository/IRepositories'

export interface StashOperation {
  type: 'ADD' | 'REMOVE'
  item: ItemInstance
  // 可加上操作序號、來源、時間戳等
}

export interface IStashService {
  /** 取得玩家背包內容 */
  getStash(runId: string): Promise<IStashContext>

  /** 依據操作日誌更新玩家背包內容（含驗證）- 用戶版本 */
  updateStashFromOperations(
    runId: string,
    operations: StashOperation[],
    characterId: string,
    newCapacity?: number
  ): Promise<void>
}

// 內部服務接口 - 只給其他服務使用
export interface IInternalStashService {
  /** 直接新增物品到倉庫 */
  addItemToStash(runId: string, item: ItemInstance): Promise<void>

  /** 直接從倉庫移除物品 */
  removeItemFromStash(runId: string, itemId: string): Promise<void>

  /** 擴充倉庫容量 */
  expandStashCapacity(runId: string, newCapacity: number): Promise<void>
}

export class StashService implements IStashService, IInternalStashService {
  private readonly stashRepo: IStashContextRepository
  private readonly characterRepo: ICharacterContextRepository
  private readonly appContextService: IAppContextService

  constructor(
    stashRepo: IStashContextRepository,
    characterRepo: ICharacterContextRepository,
    appContextService: IAppContextService
  ) {
    this.stashRepo = stashRepo
    this.characterRepo = characterRepo
    this.appContextService = appContextService
  }
  // 取得玩家背包內容
  async getStash(runId: string): Promise<IStashContext> {
    const ctx = await this.stashRepo.getById(runId)
    if (!ctx) throw new Error('StashContext not found')
    return ctx
  }

  // 依據操作日誌更新玩家背包內容，含驗證 - 用戶版本
  async updateStashFromOperations(
    runId: string,
    operations: StashOperation[],
    characterId: string,
    newCapacity?: number
  ): Promise<void> {
    const ctx = await this.getStash(runId)
    const character = await this.characterRepo.getById(characterId)
    if (!character) throw new Error('CharacterContext not found')
    const items = [...ctx.items]
    let characterRelics = [...character.relics]
    const capacity = newCapacity ?? ctx.capacity
    for (const op of operations) {
      if (op.type === 'ADD') {
        // 新增物品只能來自角色身上（relics）且 Stash 不含該物品
        if (!this.isValidAdd(op.item, items, characterRelics)) throw new Error('Invalid add operation')
        if (items.length + 1 > capacity) throw new Error('Exceeds stash capacity')
        items.push(op.item)
        // 從角色 relics 移除
        characterRelics = characterRelics.filter((r) => r.id !== op.item.id)
      } else if (op.type === 'REMOVE') {
        // 只能移除 Stash 裡已有的物品
        const idx = items.findIndex((i) => i.id === op.item.id)
        if (idx === -1) throw new Error('Item not found for removal')
        items.splice(idx, 1)
      } else {
        throw new Error('Unknown operation type')
      }
    }
    // 最終容量驗證
    if (items.length > capacity) throw new Error('Exceeds stash capacity')
    const newCtx: IStashContext = { ...ctx, items, capacity }
    // 更新 Stash 與 Character（角色 relics）
    await this.stashRepo.update(newCtx, ctx.version)
    await this.characterRepo.update({ ...character, relics: characterRelics }, character.version)
  }

  // 僅允許合法來源物品加入
  private isValidAdd(item: ItemInstance, currentItems: ItemInstance[], characterRelics: ItemInstance[]): boolean {
    // 不能新增已存在於 Stash 的物品
    if (currentItems.find((i) => i.id === item.id)) return false
    // 必須存在於角色 relics
    if (!characterRelics.find((r) => r.id === item.id)) return false
    // 檢查 item.templateId 是否存在於合法模板
    const { itemStore } = this.appContextService.GetConfig()
    if (!item.templateId || !itemStore.hasRelic(item.templateId)) return false
    return true
  }

  // ===== 內部服務方法 - 只給其他服務使用 =====

  /** 直接新增物品到倉庫 */
  async addItemToStash(runId: string, item: ItemInstance): Promise<void> {
    const ctx = await this.getStash(runId)
    const stash = this.createStashFromContext(ctx)

    if (!stash.addItem(item)) {
      throw new Error('Failed to add item to stash')
    }

    const newCtx: IStashContext = {
      ...ctx,
      items: stash.listItems(),
      capacity: stash.capacity,
    }
    await this.stashRepo.update(newCtx, ctx.version)
  }

  /** 直接從倉庫移除物品 */
  async removeItemFromStash(runId: string, itemId: string): Promise<void> {
    const ctx = await this.getStash(runId)
    const stash = this.createStashFromContext(ctx)

    if (!stash.removeItem(itemId)) {
      throw new Error('Item not found in stash')
    }

    const newCtx: IStashContext = {
      ...ctx,
      items: stash.listItems(),
      capacity: stash.capacity,
    }
    await this.stashRepo.update(newCtx, ctx.version)
  }

  /** 擴充倉庫容量 */
  async expandStashCapacity(runId: string, newCapacity: number): Promise<void> {
    const ctx = await this.getStash(runId)
    const stash = this.createStashFromContext(ctx)

    if (!stash.expandCapacity(newCapacity)) {
      throw new Error('Invalid capacity expansion')
    }

    const newCtx: IStashContext = {
      ...ctx,
      items: stash.listItems(),
      capacity: stash.capacity,
    }
    await this.stashRepo.update(newCtx, ctx.version)
  }

  // ===== 私有輔助方法 =====

  /** 從 IStashContext 創建 Stash domain object */
  private createStashFromContext(ctx: IStashContext): IStash {
    return new Stash([...ctx.items], ctx.capacity)
  }
}
