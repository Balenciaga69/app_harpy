import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InitRunDto } from './dto/InitRunDto';
import { BuyItemDto } from './dto/BuyItemDto';
import { SellItemDto } from './dto/SellItemDto';
import { RefreshShopDto } from './dto/RefreshShopDto';
import { RunService } from './run.service';

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
    return this.runService.getProfessions();
  }

  /**
   * GET /api/run/relics - 取得所有聖物模板
   */
  @Get('relics')
  @ApiOperation({ summary: '取得所有聖物模板' })
  @ApiResponse({
    status: 200,
    description: '成功取得聖物模板列表',
  })
  async getRelicTemplates() {
    return this.runService.getRelicTemplates();
  }

  /**
   * POST /api/run/init - 初始化新遊戲進度
   */
  @Post('init')
  async initializeRun(@Body() dto: InitRunDto) {
    return this.runService.initializeRun(dto);
  }

  /**
   * POST /api/run/shop/buy - 在商店購買物品
   */
  @Post('shop/buy')
  async buyItem(@Body() dto: BuyItemDto) {
    return this.runService.buyItem(dto);
  }

  /**
   * POST /api/run/shop/sell - 賣出物品
   */
  @Post('shop/sell')
  async sellItem(@Body() dto: SellItemDto) {
    return this.runService.sellItem(dto);
  }

  /**
   * POST /api/run/shop/refresh - 刷新商店物品
   */
  @Post('shop/refresh')
  async refreshShop(@Body() dto: RefreshShopDto) {
    return this.runService.refreshShop(dto);
  }
}
