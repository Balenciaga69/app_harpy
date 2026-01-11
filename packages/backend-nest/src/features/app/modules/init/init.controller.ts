import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger'
import { InitRunDto } from './dto/InitRunDto'
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
  initializeRun(@Body() dto: InitRunDto) {
    return this.initService.initializeRun(dto)
  }
}
