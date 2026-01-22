import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ContextInitializationInterceptor } from 'src/features/shared/interceptors/context-initialization.interceptor'

import { IsAuthenticatedGuard } from '../auth/auth.guard'
import { GetUser } from '../auth/get-user.decorator'
import { EquipmentService } from '../equipment/equipment.service'
import { ResultToExceptionMapper } from '../shared/mappers/result-to-exception-mapper'
import { BuyItemDto } from '../shop/model/buy-item.dto'
import { RefreshShopDto } from '../shop/model/refresh-shop.dto'
import { SellItemDto } from '../shop/model/sell-item.dto'
import { ShopNestService } from '../shop/shop.service'
import { InitRunDto } from './model/init-run.dto'
import { RunRelicActionDto } from './model/run-relic-action.dto'
import { RunApiService } from './service/run-api.service'
import { RunOptionsService } from './service/run-options.service'
@ApiTags('Game Run - 遊戲進行')
@Controller('api/run')
export class RunController {
  constructor(
    private readonly runOptionsService: RunOptionsService,
    private readonly runService: RunApiService,
    private readonly shopService: ShopNestService,
    private readonly equipmentService: EquipmentService
  ) {}
  @Get('professions')
  getProfessions() {
    return { success: true, data: this.runOptionsService.getAvailableProfessions() }
  }
  @Get('relics')
  getRelicTemplates() {
    return { success: true, data: this.runOptionsService.getAllRelicTemplates() }
  }
  @Get('professions/:id/started-relics')
  getProfessionRelics(@Param('id') id: string) {
    try {
      return { success: true, data: this.runOptionsService.getSelectableStartingRelics(id) }
    } catch {
      throw new BadRequestException({ error: 'PROFESSION_NOT_FOUND' })
    }
  }
  @Post('init-for-user')
  @UseGuards(IsAuthenticatedGuard)
  @ApiBearerAuth('access-token')
  async initializeRunForUser(@GetUser() user: { userId?: string }, @Body() dto: InitRunDto) {
    if (!user.userId) throw new UnauthorizedException('MISSING_USER_ID')
    const result = await this.runService.initializeRunForUser(user.userId, dto)
    ResultToExceptionMapper.throwIfFailure(result)
    const context = result.value!.contexts
    return {
      success: true,
      data: {
        runId: context.runContext.runId,
        professionId: context.characterContext.professionId,
        seed: context.runContext.seed,
      },
    }
  }
  // --- Shop ---
  @UseInterceptors(ContextInitializationInterceptor)
  @Get('shop/items')
  getShopItems(@Query('runId') runId: string) {
    return this.shopService.getShopItems({ runId })
  }
  @UseInterceptors(ContextInitializationInterceptor)
  @Post('shop/buy')
  buyItem(@Body() dto: BuyItemDto) {
    return this.shopService.buyItem(dto)
  }
  @UseInterceptors(ContextInitializationInterceptor)
  @Post('shop/sell')
  sellItem(@Body() dto: SellItemDto) {
    return this.shopService.sellItem(dto)
  }
  @UseInterceptors(ContextInitializationInterceptor)
  @Post('shop/refresh')
  refreshShop(@Body() dto: RefreshShopDto) {
    return this.shopService.refreshShop(dto)
  }
  // --- Equipment ---
  @Post('equipment/equip')
  equipRelic(@Body() dto: RunRelicActionDto) {
    return this.equipmentService.equipRelic(dto.relicId)
  }
  @Post('equipment/unequip')
  unequipRelic(@Body() dto: RunRelicActionDto) {
    return this.equipmentService.unequipRelic(dto.relicId)
  }
}
