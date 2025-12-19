import { nanoid } from 'nanoid'
import type {
  IGamblingOrchestrator,
  IBetRequest,
  IPlayerAssets,
  IGamblingConfig,
  IGamblingResult,
  ITransactionResult,
} from '../interfaces'
import { GameMode } from '../interfaces'
import { RNGService } from '../domain/RNGService'
import { SlotEngine } from '../domain/SlotEngine'
import { FixedOddsEngine } from '../domain/FixedOddsEngine'
import { PayoutCalculator } from '../domain/PayoutCalculator'
import { DEFAULT_SLOT_CONFIG } from '../domain/GamblingConfig'
import { BetValidator } from './BetValidator'

/**
 * 賭博編排器實作
 */
export class GamblingOrchestrator implements IGamblingOrchestrator {
  private slotEngine: SlotEngine
  private fixedOddsEngine: FixedOddsEngine
  private payoutCalculator: PayoutCalculator
  private betValidator: BetValidator
  private defaultConfig: IGamblingConfig

  constructor(
    slotEngine?: SlotEngine,
    fixedOddsEngine?: FixedOddsEngine,
    payoutCalculator?: PayoutCalculator,
    betValidator?: BetValidator,
    defaultConfig?: IGamblingConfig
  ) {
    this.slotEngine = slotEngine || new SlotEngine()
    this.fixedOddsEngine = fixedOddsEngine || new FixedOddsEngine()
    this.payoutCalculator = payoutCalculator || new PayoutCalculator()
    this.betValidator = betValidator || new BetValidator()
    this.defaultConfig = defaultConfig || DEFAULT_SLOT_CONFIG
  }

  /* 執行下注 */
  async placeBet(
    betRequest: IBetRequest,
    playerAssets: IPlayerAssets,
    config?: IGamblingConfig
  ): Promise<IGamblingResult> {
    const actualConfig = config || this.defaultConfig

    // 驗證下注
    const validation = this.betValidator.validate(betRequest, playerAssets)
    if (!validation.isValid) {
      throw new Error(`下注驗證失敗: ${validation.error}`)
    }

    // 生成種子（若無提供）
    const seed = betRequest.seed || nanoid()
    const rng = new RNGService(seed)

    // 根據遊戲模式執行
    let outcome: import('../interfaces').ISlotOutcome | import('../interfaces').IFixedOddsOutcome
    if (actualConfig.gameMode === GameMode.SLOT) {
      outcome = this.slotEngine.spin(betRequest, rng, actualConfig)
    } else if (actualConfig.gameMode === GameMode.FIXED_ODDS) {
      outcome = this.fixedOddsEngine.bet(betRequest, rng, actualConfig)
    } else {
      throw new Error(`不支援的遊戲模式: ${actualConfig.gameMode}`)
    }

    // 計算賠付
    const payoutCalc = this.payoutCalculator.calculate(outcome, betRequest.betAmount, actualConfig)

    // 模擬交易（實際應該呼叫 TransactionAdapter）
    const transaction: ITransactionResult = {
      success: true,
      transactionId: nanoid(),
      balanceBefore: playerAssets.availableGold,
      balanceAfter: playerAssets.availableGold - betRequest.betAmount + payoutCalc.finalPayout,
      error: undefined,
    }

    // 計算淨收益
    const netProfit = payoutCalc.finalPayout - betRequest.betAmount

    return {
      outcome,
      payoutAmount: payoutCalc.finalPayout,
      netProfit,
      transaction,
      seed,
      timestamp: Date.now(),
    }
  }

  /* 取得預設配置 */
  getDefaultConfig(): IGamblingConfig {
    return this.defaultConfig
  }
}
