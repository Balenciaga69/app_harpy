import { Injectable, BadRequestException } from '@nestjs/common'
import { GameStartOptionsService, RunInitializationService } from 'src/from-game-core'
import { ContextManager } from 'src/infra/context/ContextManager'
import { InitRunDto } from './dto/InitRunDto'
@Injectable()
export class InitService {
  constructor(
    private readonly gameStartOptionsService: GameStartOptionsService,
    private readonly runInitializationService: RunInitializationService,
    private readonly contextManager: ContextManager
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
  async initializeRun(dto: InitRunDto) {
    const result = await this.runInitializationService.initialize({
      professionId: dto.professionId,
      seed: dto.seed,
      startingRelicIds: dto.startingRelicIds,
    })
    if (result.isFailure || !result.value) {
      throw new BadRequestException({
        error: result.error ?? 'unknown_error',
        message: '初始化 Run 失敗',
      })
    }
    const appContext = result.value
    try {
      await this.contextManager.saveContext(appContext)
    } catch (error) {
      throw new BadRequestException({
        error: 'CONTEXT_SAVE_FAILED',
        message: '無法保存運行上下文',
        details: error instanceof Error ? error.message : undefined,
      })
    }
    return {
      success: true,
      data: {
        runId: appContext.contexts.runContext.runId,
        professionId: appContext.contexts.characterContext.professionId,
        seed: appContext.contexts.runContext.seed,
      },
    }
  }
}
