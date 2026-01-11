import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger'
import { IsAuthenticatedGuard } from 'src/features/auth/infra/auth.guard'
import { GetUser } from 'src/features/auth/infra/get-user.decorator'

import { InitRunDto } from './dto/init-run.dto'
import { InitService } from './init.service'
@Controller('api/run')
export class InitController {
  constructor(private readonly initService: InitService) {}
  @Get('professions')
  @ApiOperation({ summary: '取得職業列表' })
  getProfessions() {
    return this.initService.getProfessions()
  }
  @Get('relics')
  @ApiOperation({ summary: '取得所有聖物模板' })
  getRelicTemplates() {
    return this.initService.getRelicTemplates()
  }
  @Get('professions/:id/started-relics')
  @ApiOperation({ summary: '取得指定職業的可選起始聖物' })
  @ApiParam({ name: 'id', description: '職業 id (e.g., WARRIOR)' })
  getProfessionRelics(@Param('id') id: string) {
    return this.initService.getSelectableStartingRelics(id)
  }
  @Post('init')
  @ApiOperation({ summary: '初始化新遊戲 (不綁定用戶，向後兼容)' })
  @ApiBody({
    schema: {
      example: {
        professionId: 'WARRIOR',
        seed: 12345,
        startingRelicIds: ['relic_warrior_resolute_heart'],
      },
    },
  })
  initializeRun(@Body() dto: InitRunDto) {
    return this.initService.initializeRun(dto)
  }
  @Post('init-for-user')
  @UseGuards(IsAuthenticatedGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '為認證用戶初始化新遊戲' })
  @ApiBody({
    schema: {
      example: {
        professionId: 'WARRIOR',
        seed: 12345,
        startingRelicIds: ['relic_warrior_resolute_heart'],
      },
    },
  })
  async initializeRunForUser(@GetUser() user: unknown, @Body() dto: InitRunDto) {
    const userId = (user as { userId?: string }).userId
    if (!userId) {
      throw new Error('MISSING_USER_ID')
    }
    return this.initService.initializeRunForUser(userId, dto)
  }
}
