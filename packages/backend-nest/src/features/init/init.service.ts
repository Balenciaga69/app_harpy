import { BadRequestException, Injectable } from '@nestjs/common'
import { RunService } from 'src/features/run/app/run.service'
import { GameStartOptionsService, RunInitializationService } from 'src/from-game-core'
import { ResultToExceptionMapper } from 'src/infra/mappers/result-to-exception-mapper'
import { InitRunDto } from './dto/init-run.dto'
@Injectable()
export class InitService {
  constructor(
    private readonly gameStartOptionsService: GameStartOptionsService,
    private readonly runInitializationService: RunInitializationService,
    private readonly runService: RunService
  ) {}
  getProfessions() {
    const professions = this.gameStartOptionsService.getAvailableProfessions()
    return {
      success: true,
      data: professions.map((prof) => ({
        id: prof.id,
        name: prof.name,
        desc: prof.desc,
      })),
    }
  }
  getRelicTemplates() {
    const professions = this.gameStartOptionsService.getAvailableProfessions()
    const allRelics = professions.flatMap((prof) => this.gameStartOptionsService.getSelectableStartingRelics(prof.id))
    return {
      success: true,
      data: allRelics.map((relic) => ({
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
  getSelectableStartingRelics(professionId: string) {
    try {
      const relics = this.gameStartOptionsService.getSelectableStartingRelics(professionId)
      return {
        success: true,
        data: relics.map((relic) => ({
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
    } catch {
      throw new BadRequestException({
        error: 'PROFESSION_NOT_FOUND',
        message: '職業不存在或獲取起始聖物失敗',
      })
    }
  }
  /**
   * 為用戶初始化新的 Run
   * @param userId 用戶 ID（由認證 Guard 提供）
   * @param dto 遊戲初始化參數
   */
  async initializeRunForUser(userId: string, dto: InitRunDto) {
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
  /**
   * 不綁定用戶的初始化（向後兼容）
   * @deprecated 使用 initializeRunForUser 代替
   */
  async initializeRun(dto: InitRunDto) {
    const result = await this.runInitializationService.initialize({
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
