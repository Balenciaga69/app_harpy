/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Injectable, BadRequestException } from '@nestjs/common'
import { InMemoryContextRepository } from '../infra/InMemoryContextRepository'
import { ItemGenerationService } from '../infra/ItemGenerationService'
import { ShopContextHandler } from '../infra/ShopContextHandler'
import { InitRunDto } from './dto/InitRunDto'
import { BuyItemDto } from './dto/BuyItemDto'
import { SellItemDto } from './dto/SellItemDto'
import { RefreshShopDto } from './dto/RefreshShopDto'
import { ConfigService } from './config.service'
import { RunInitializationService, ShopService } from '../from-game-core'
/**
 * Run 應用服務：協調 game-core 邏輯與後端基礎設施
 */
@Injectable()
export class RunService {
  constructor(
    private readonly contextRepo: InMemoryContextRepository,
    private readonly configService: ConfigService,
    private readonly itemGenService: ItemGenerationService,
    private readonly shopContextHandler: ShopContextHandler
  ) {}
  /**
   * 取得職業列表
   */
  async getProfessions() {
    const configStore = await this.configService.getConfigStore()
    const professions = configStore.professionStore.getAllProfessions()
    return {
      success: true,
      data: professions.map((prof: any) => ({
        id: prof.id,
        name: prof.name,
        desc: prof.desc,
      })),
    }
  }
  /**
   * 取得所有聖物模板
   */
  async getRelicTemplates() {
    const configStore = await this.configService.getConfigStore()
    const relics = configStore.itemStore.getAllRelics()
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
  }
  /**
   * 初始化新 Run
   * 流程：調用 game-core 的 RunInitializationService
   */
  async initializeRun(dto: InitRunDto) {
    const configStore = await this.configService.getConfigStore()
    const runInitService = new RunInitializationService(configStore, this.contextRepo as any)
    const result = await runInitService.initialize({
      professionId: dto.professionId,
      seed: dto.seed,
      persist: true,
    })
    if (result.isFailure) {
      throw new BadRequestException({
        error: result.error,
        message: '初始化 Run 失敗',
      })
    }
    return {
      success: true,
      data: {
        runId: result.value!.contexts.runContext.runId,
        professionId: result.value!.contexts.characterContext.professionId,
        seed: result.value!.contexts.runContext.seed,
      },
    }
  }
  /**
   * 在商店購買物品
   */
  buyItem(dto: BuyItemDto) {
    const shopService = new ShopService(this.itemGenService as any, this.shopContextHandler as any)
    const result = shopService.buyItem(dto.itemId)
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
  /**
   * 賣出物品
   */
  sellItem(dto: SellItemDto) {
    const shopService = new ShopService(this.itemGenService as any, this.shopContextHandler as any)
    const result = shopService.sellItem(dto.itemId)
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
  /**
   * 刷新商店物品
   */
  refreshShop(dto: RefreshShopDto) {
    const shopService = new ShopService(this.itemGenService as any, this.shopContextHandler as any)
    const result = shopService.refreshShopItems()
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
