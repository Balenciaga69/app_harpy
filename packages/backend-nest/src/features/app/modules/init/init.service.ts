import { Injectable, BadRequestException } from '@nestjs/common'
import { GameStartOptionsService, RunInitializationService } from 'src/from-game-core'
import { ContextManager } from 'src/infra/context/ContextManager'
import { InitRunDto } from './dto/InitRunDto'
/**
 * 初始化 Run 的服務
 * 職責：處理遊戲進度初始化邏輯
 */
@Injectable()
export class InitService {
  constructor(
    private readonly gameStartOptionsService: GameStartOptionsService,
    private readonly runInitializationService: RunInitializationService,
    private readonly contextManager: ContextManager
  ) {}
  /**
   * 取得所有可用職業
   */
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
  /**
   * 取得所有聖物模板
   */
  getRelicTemplates() {
    const professions = this.gameStartOptionsService.getAvailableProfessions()
    const allRelics = professions.flatMap((prof) => this.gameStartOptionsService.getSelectableStartingRelics(prof.id))
    return {
      success: true,
      data: allRelics.map((relic: any) => ({
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
  /**
   * 取得指定職業的可選起始聖物
   */
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
   * 初始化新遊戲進度
   */
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
    // 保存 appContext 到 ContextManager
    try {
      this.contextManager.saveContext(appContext)
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
