/* eslint-disable @typescript-eslint/require-await */
import { Controller, Post, Get, Body, Param } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger'
import { InitRunDto } from '../dto/InitRunDto'
import { BuyItemDto } from '../dto/BuyItemDto'
import { SellItemDto } from '../dto/SellItemDto'
import { RefreshShopDto } from '../dto/RefreshShopDto'
import { RunService } from '../services/run.service'
/**
 * Run 控制器：處理與遊戲進度初始化相關的 HTTP 請求
 */
@Controller('api/run')
export class RunController {
  constructor(private readonly runService: RunService) {}
  /**
   * GET /api/run/professions - 取得職業列表
   */
  @Get('professions')
  @ApiOperation({ summary: '取得職業列表' })
  @ApiResponse({
    status: 200,
    description: '成功取得職業列表',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'warrior',
            name: { tw: '戰士', en: 'Warrior' },
            desc: { tw: '強力的近戰職業', en: 'Powerful melee class' },
          },
        ],
      },
    },
  })
  async getProfessions() {
    return this.runService.getProfessions()
  }
  /**
   * GET /api/run/relics - 取得所有聖物模板
   */
  @Get('relics')
  @ApiOperation({ summary: '取得所有聖物模板' })
  @ApiResponse({
    status: 200,
    description: '成功取得聖物模板列表',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'relic_warrior_resolute_heart',
            name: { tw: '堅毅之心', en: 'Resolute Heart' },
            desc: { tw: '...繁體描述...', en: '...en desc...' },
            itemType: 'RELIC',
            rarity: 'COMMON',
            affixIds: ['affix_warrior_hp_boost_1'],
            tags: ['HP'],
            loadCost: 1,
            maxStacks: 1,
          },
        ],
      },
    },
  })
  async getRelicTemplates() {
    return this.runService.getRelicTemplates()
  }

  /**
   * GET /api/run/professions/:id/relics - 取得指定職業的可選起始聖物
   */
  @Get('professions/:id/relics')
  @ApiOperation({ summary: '取得指定職業的可選起始聖物' })
  @ApiParam({ name: 'id', description: '職業 id (e.g., WARRIOR)' })
  @ApiResponse({ status: 200, description: '成功取得起始聖物列表' })
  async getProfessionRelics(@Param('id') id: string) {
    return this.runService.getSelectableStartingRelics(id)
  }
  /**
   * POST /api/run/init - 初始化新遊戲進度
   */
  @Post('init')
  @ApiOperation({ summary: '初始化新遊戲 (可帶 professionId 與可選起始 relics)' })
  @ApiBody({
    schema: {
      example: {
        professionId: 'WARRIOR',
        seed: 12345,
        startingRelicIds: ['relic_warrior_resolute_heart'],
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '初始化成功，會回傳 runId 與綁定的 professionId',
    schema: {
      example: {
        success: true,
        data: {
          runId: 'run_abc123',
          professionId: 'WARRIOR',
          seed: 12345,
        },
      },
    },
  })
  async initializeRun(@Body() dto: InitRunDto) {
    return this.runService.initializeRun(dto)
  }
  /**
   * POST /api/run/shop/buy - 在商店購買物品
   */
  @Post('shop/buy')
  async buyItem(@Body() dto: BuyItemDto) {
    return this.runService.buyItem(dto)
  }
  /**
   * POST /api/run/shop/sell - 賣出物品
   */
  @Post('shop/sell')
  async sellItem(@Body() dto: SellItemDto) {
    return this.runService.sellItem(dto)
  }
  /**
   * POST /api/run/shop/refresh - 刷新商店物品
   */
  @Post('shop/refresh')
  async refreshShop(@Body() dto: RefreshShopDto) {
    return this.runService.refreshShop(dto)
  }
}
