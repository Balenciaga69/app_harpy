import { nanoid } from 'nanoid'
import type {
  IPreCombatOrchestrator,
  IPreCombatState,
  IEncounterContext,
  IPlayerSummary,
  IBetRequest,
  IRerollResult,
} from '../interfaces'
import type { IVariableGenerator } from '../interfaces'
import type { IBettingService } from '../interfaces'
import type { IRerollController } from '../interfaces'
import { VariableGenerator } from '../domain/VariableGenerator'
import { BettingService } from '../domain/BettingService'
import { RerollController } from './RerollController'

/**
 * PreCombat 編排器實作
 */
export class PreCombatOrchestrator implements IPreCombatOrchestrator {
  private variableGenerator: IVariableGenerator
  private bettingService: IBettingService
  private rerollController: IRerollController

  constructor(
    variableGenerator?: IVariableGenerator,
    bettingService?: IBettingService,
    rerollController?: IRerollController
  ) {
    this.variableGenerator = variableGenerator || new VariableGenerator()
    this.bettingService = bettingService || new BettingService()
    this.rerollController = rerollController || new RerollController(this.variableGenerator)
  }

  /* 生成賽前準備狀態 */
  generatePreCombat(
    encounterContext: IEncounterContext,
    playerSummary: IPlayerSummary,
    seed?: string | number
  ): IPreCombatState {
    const actualSeed = seed || nanoid()

    // 生成變數（1-3 個）
    const variables = this.variableGenerator.generate({
      seed: actualSeed,
      encounterContext,
      variableCountRange: [1, 3],
    })

    return {
      variables,
      betting: null,
      confirmed: false,
      seed: actualSeed,
      createdAt: Date.now(),
    }
  }

  /* 下注 */
  placeBet(state: IPreCombatState, betRequest: IBetRequest): IPreCombatState {
    if (state.confirmed) {
      throw new Error('賽前狀態已確認，無法下注')
    }

    const bettingResult = this.bettingService.placeBet(betRequest)

    return {
      ...state,
      betting: bettingResult,
    }
  }

  /* Reroll 變數 */
  rerollVariables(
    state: IPreCombatState,
    playerSummary: IPlayerSummary,
    seed: string | number
  ): { state: IPreCombatState; rerollResult: IRerollResult } {
    if (state.confirmed) {
      throw new Error('賽前狀態已確認，無法 reroll')
    }

    // 注意：這裡需要 encounterContext 來重新生成變數
    // 實際使用時應該從外部傳入或從 state 中取得
    // 這裡先簡化處理
    const rerollResult = this.rerollController.reroll(state.variables, playerSummary, seed)

    // 實際實作中，應該使用 variableGenerator 重新生成
    // 這裡暫時保持原變數
    const newState: IPreCombatState = {
      ...state,
      seed,
    }

    return {
      state: newState,
      rerollResult,
    }
  }

  /* 確認並準備進入戰鬥 */
  confirmAndStartCombat(state: IPreCombatState): IPreCombatState {
    if (state.confirmed) {
      throw new Error('賽前狀態已確認')
    }

    return {
      ...state,
      confirmed: true,
    }
  }
}
