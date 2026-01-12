import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger'
import { IsAuthenticatedGuard } from 'src/features/auth/infra/auth.guard'
import { GetUser } from 'src/features/auth/infra/get-user.decorator'
import { ResultToExceptionMapper } from 'src/features/shared/mappers/result-to-exception-mapper'
import { RunOptionsService } from '../app/run-options.service'
import { RunService } from '../app/run.service'
import { InitRunDto } from '../dto/init-run.dto'
@Controller('api/run')
export class RunController {
  constructor(
    private readonly runOptionsService: RunOptionsService,
    private readonly runService: RunService
  ) {}
  @Get('professions')
  @ApiOperation({ summary: '取得職業列表' })
  getProfessions() {
    const professions = this.runOptionsService.getAvailableProfessions()
    return {
      success: true,
      data: professions,
    }
  }
  @Get('relics')
  @ApiOperation({ summary: '取得所有聖物模板' })
  getRelicTemplates() {
    const relics = this.runOptionsService.getAllRelicTemplates()
    return {
      success: true,
      data: relics,
    }
  }
  @Get('professions/:id/started-relics')
  @ApiOperation({ summary: '取得指定職業的可選起始聖物' })
  @ApiParam({ name: 'id', description: '職業 id (e.g., WARRIOR)' })
  getProfessionRelics(@Param('id') id: string) {
    try {
      const relics = this.runOptionsService.getSelectableStartingRelics(id)
      return {
        success: true,
        data: relics,
      }
    } catch {
      throw new BadRequestException({
        error: 'PROFESSION_NOT_FOUND',
        message: '職業不存在或獲取起始聖物失敗',
      })
    }
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
      throw new UnauthorizedException('MISSING_USER_ID')
    }
    const result = await this.runService.initializeRunForUser(userId, {
      professionId: dto.professionId,
      seed: dto.seed,
      startingRelicIds: dto.startingRelicIds,
    })
    ResultToExceptionMapper.throwIfFailure(result)
    const appContext = result.value!
    const runId = appContext.contexts.runContext.runId
    return {
      success: true,
      data: {
        runId,
        professionId: appContext.contexts.characterContext.professionId,
        seed: appContext.contexts.runContext.seed,
      },
    }
  }
}
