import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { InitRunDto } from './dto/InitRunDto'
import { InitService } from './init.service'

@Controller('api/run')
export class InitController {
  constructor(private readonly initService: InitService) {}

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
  getProfessions() {
    return this.initService.getProfessions()
  }

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
  getRelicTemplates() {
    return this.initService.getRelicTemplates()
  }

  @Get('professions/:id/relics')
  @ApiOperation({ summary: '取得指定職業的可選起始聖物' })
  @ApiParam({ name: 'id', description: '職業 id (e.g., WARRIOR)' })
  @ApiResponse({ status: 200, description: '成功取得起始聖物列表' })
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
  initializeRun(@Body() dto: InitRunDto) {
    return this.initService.initializeRun(dto)
  }
}
