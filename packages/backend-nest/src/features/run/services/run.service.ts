import { Injectable, BadRequestException } from '@nestjs/common'
import { InitRunDto } from '../dto/InitRunDto'
import { BuyItemDto } from '../dto/BuyItemDto'
import { SellItemDto } from '../dto/SellItemDto'
import { RefreshShopDto } from '../dto/RefreshShopDto'
import { ConfigService } from './config.service'
import { ShopServiceWrapper } from './shop-service.wrapper'
import { RunApplicationService } from './run-application.service'

/**
 * Run 業務服務：HTTP 適配層
 * 職責：將應用服務的結果轉換為 DTO，適配 Controller
 * 這是可選的中間層，用於處理 HTTP 特定的邏輯
 */
@Injectable()
export class RunService {
  constructor(
    private readonly configService: ConfigService,
    private readonly shopServiceWrapper: ShopServiceWrapper,
    private readonly runApplicationService: RunApplicationService
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
   * 取得指定職業的可選起始聖物（BFF 規則友好）
   */
  async getSelectableStartingRelics(professionId: string) {
    const configStore = await this.configService.getConfigStore()
    const profession = configStore.professionStore.getProfession(professionId)
    if (!profession) {
      throw new BadRequestException({
        error: 'PROFESSION_NOT_FOUND',
        message: '職業不存在',
      })
    }
    const relics = configStore.itemStore.getManyRelics([...profession.startRelicIds])
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
    try {
      const appContext = await this.runApplicationService.initializeRun(
        dto.professionId ?? '',
        dto.seed,
        dto.startingRelicIds
      )

      return {
        success: true,
        data: {
          runId: appContext.contexts.runContext.runId,
          professionId: (appContext.contexts.characterContext as any).professionId,
          seed: appContext.contexts.runContext.seed,
        },
      }
    } catch (error) {
      throw new BadRequestException({
        error: error instanceof Error ? error.message : 'unknown_error',
        message: '初始化 Run 失敗',
      })
    }
  }
  /**
   * 在商店購買物品
   */
  buyItem(dto: BuyItemDto) {
    const result = this.shopServiceWrapper.buyItem(dto.itemId ?? '')
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
    const result = this.shopServiceWrapper.sellItem(dto.itemId ?? '')
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
    const result = this.shopServiceWrapper.refreshShopItems()
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
