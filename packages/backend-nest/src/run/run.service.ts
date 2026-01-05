/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, BadRequestException } from '@nestjs/common'
import { RunInitializationService, ShopService } from '@app-harpy/game-core'
import { InMemoryContextRepository } from '../infra/InMemoryContextRepository'
import { InitRunDto } from './dto/InitRunDto'
import { BuyItemDto } from './dto/BuyItemDto'
import { SellItemDto } from './dto/SellItemDto'
import { RefreshShopDto } from './dto/RefreshShopDto'
import { ConfigService } from './config.service'

/**
 * Run 應用服務：協調 game-core 邏輯與後端基礎設施
 */
@Injectable()
export class RunService {
  constructor(
    private readonly contextRepo: InMemoryContextRepository,
    private readonly configService: ConfigService
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

    const runInitService = new RunInitializationService(configStore, {
      batch: this.contextRepo,
    })

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
  async buyItem(dto: BuyItemDto) {
    const configStore = await this.configService.getConfigStore()
    const shopService = new ShopService(configStore, {
      batch: this.contextRepo,
    })

    const result = await shopService.buyItem({
      runId: dto.runId,
      itemId: dto.itemId,
      persist: true,
    })

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
  async sellItem(dto: SellItemDto) {
    const configStore = await this.configService.getConfigStore()
    const shopService = new ShopService(configStore, {
      batch: this.contextRepo,
    })

    const result = await shopService.sellItem({
      runId: dto.runId,
      itemId: dto.itemId,
      persist: true,
    })

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
  async refreshShop(dto: RefreshShopDto) {
    const configStore = await this.configService.getConfigStore()
    const shopService = new ShopService(configStore, {
      batch: this.contextRepo,
    })

    const result = await shopService.refreshShop({
      runId: dto.runId,
      persist: true,
    })

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
