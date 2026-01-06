import { Injectable, BadRequestException, Optional } from '@nestjs/common'
import { GameStartOptionsService, RunInitializationService, ShopService } from 'src/from-game-core'
import { BuyItemDto } from '../dto/BuyItemDto'
import { InitRunDto } from '../dto/InitRunDto'
import { RefreshShopDto } from '../dto/RefreshShopDto'
import { SellItemDto } from '../dto/SellItemDto'

/**
 * RunNestService
 * 處理與遊戲進度、商店操作相關的業務邏輯
 */
@Injectable()
export class RunNestService {
  constructor(
    private readonly gameStartOptionsService: GameStartOptionsService,
    private readonly runInitializationService: RunInitializationService,
    @Optional() private readonly shopService: ShopService
  ) {}

  getProfessions() {
    const professions = this.gameStartOptionsService.getAvailableProfessions()
    return {
      success: true,
      data: professions.map((prof: any) => ({
        id: prof.id,
        name: prof.name,
        desc: prof.desc,
      })),
    }
  }

  getRelicTemplates() {
    const professions = this.gameStartOptionsService.getAvailableProfessions()
    const allRelics = professions.flatMap((p: any) => this.gameStartOptionsService.getSelectableStartingRelics(p.id))

    return {
      success: true,
      data: allRelics.map((relic: any) => ({
        id: relic.id,
        name: relic.name,
        desc: relic.desc,
        itemType: relic.itemType,
        rarity: relic.rarity,
        affixIds: relic.affixIds,
        tags: relic.tags,
        loadCost: relic.loadCost,
        maxStacks: relic.maxStacks,
      })),
    }
  }

  getSelectableStartingRelics(professionId: string) {
    try {
      const relics = this.gameStartOptionsService.getSelectableStartingRelics(professionId)
      return {
        success: true,
        data: relics.map((relic: any) => ({
          id: relic.id,
          name: relic.name,
          desc: relic.desc,
          itemType: relic.itemType,
          rarity: relic.rarity,
          affixIds: relic.affixIds,
          tags: relic.tags,
          loadCost: relic.loadCost,
          maxStacks: relic.maxStacks,
        })),
      }
    } catch {
      throw new BadRequestException({
        error: 'PROFESSION_NOT_FOUND',
        message: '職業不存在或獲取起始聖物失敗',
      })
    }
  }

  async initializeRun(dto: InitRunDto) {
    const result = await this.runInitializationService.initialize({
      professionId: dto.professionId,
      seed: dto.seed,
      startingRelicIds: dto.startingRelicIds,
      persist: true,
    })

    if (result.isFailure || !result.value) {
      throw new BadRequestException({
        error: result.error ?? 'unknown_error',
        message: '初始化 Run 失敗',
      })
    }

    const appContext = result.value
    return {
      success: true,
      data: {
        runId: appContext.contexts.runContext.runId,
        professionId: (appContext.contexts.characterContext as any).professionId,
        seed: appContext.contexts.runContext.seed,
      },
    }
  }

  buyItem(dto: BuyItemDto) {
    if (!this.shopService) {
      throw new BadRequestException({ error: 'CONTEXT_NOT_READY', message: '尚未進入遊戲或上下文未就緒' })
    }
    const result = this.shopService.buyItem(dto.itemId)
    if (result.isFailure) {
      throw new BadRequestException({
        error: result.error,
        message: '購買物品失敗',
      })
    }
    return {
      success: true,
      message: '購買成功',
      data: {
        runId: dto.runId,
        itemId: dto.itemId,
      },
    }
  }

  sellItem(dto: SellItemDto) {
    if (!this.shopService) {
      throw new BadRequestException({ error: 'CONTEXT_NOT_READY', message: '尚未進入遊戲或上下文未就緒' })
    }
    const result = this.shopService.sellItem(dto.itemId)
    if (result.isFailure) {
      throw new BadRequestException({
        error: result.error,
        message: '賣出物品失敗',
      })
    }
    return {
      success: true,
      message: '賣出成功',
      data: {
        runId: dto.runId,
        itemId: dto.itemId,
      },
    }
  }

  refreshShop(dto: RefreshShopDto) {
    if (!this.shopService) {
      throw new BadRequestException({ error: 'CONTEXT_NOT_READY', message: '尚未進入遊戲或上下文未就緒' })
    }
    const result = this.shopService.refreshShopItems()
    if (result.isFailure) {
      throw new BadRequestException({
        error: result.error,
        message: '刷新商店失敗',
      })
    }
    return {
      success: true,
      message: '刷新成功',
      data: {
        runId: dto.runId,
      },
    }
  }
}
