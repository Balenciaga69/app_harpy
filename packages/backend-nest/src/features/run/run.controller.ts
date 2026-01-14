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
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger'
import { IsAuthenticatedGuard } from '../auth/auth.guard'
import { GetUser } from '../auth/get-user.decorator'
import { ResultToExceptionMapper } from '../shared/mappers/result-to-exception-mapper'
import { InitRunDto } from './model/init-run.dto'
import { RunApiService } from './service/run-api.service'
import { RunOptionsService } from './service/run-options.service'
@Controller('api/run')
export class RunController {
  constructor(
    private readonly runOptionsService: RunOptionsService,
    private readonly runService: RunApiService
  ) {}
  @Get('professions')
  getProfessions() {
    const professions = this.runOptionsService.getAvailableProfessions()
    return {
      success: true,
      data: professions,
    }
  }
  @Get('relics')
  getRelicTemplates() {
    const relics = this.runOptionsService.getAllRelicTemplates()
    return {
      success: true,
      data: relics,
    }
  }
  @Get('professions/:id/started-relics')
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
