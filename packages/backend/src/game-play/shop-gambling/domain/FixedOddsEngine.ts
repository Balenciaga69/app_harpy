import type {
  IFixedOddsEngine,
  IFixedOddsOption,
  IBetRequest,
  IGamblingConfig,
  IFixedOddsOutcome,
  IRNGService,
  IFixedOddsBetMeta,
} from '../interfaces'

/**
 * 預設固定賠率選項
 */
const DEFAULT_OPTIONS: IFixedOddsOption[] = [
  {
    id: 'high_risk',
    description: '高風險（18% 勝率，5x 賠率）',
    winProbability: 0.18,
    multiplier: 5,
  },
  {
    id: 'medium_risk',
    description: '中風險（30% 勝率，3x 賠率）',
    winProbability: 0.3,
    multiplier: 3,
  },
  {
    id: 'low_risk',
    description: '低風險（60% 勝率，1.5x 賠率）',
    winProbability: 0.6,
    multiplier: 1.5,
  },
]

/**
 * 固定賠率引擎實作
 */
export class FixedOddsEngine implements IFixedOddsEngine {
  private options: IFixedOddsOption[]

  constructor(options: IFixedOddsOption[] = DEFAULT_OPTIONS) {
    this.options = options
  }

  /* 執行下注 */
  bet(betRequest: IBetRequest, rng: IRNGService, config: IGamblingConfig): IFixedOddsOutcome {
    const betMeta = betRequest.betMeta as IFixedOddsBetMeta | undefined
    if (!betMeta || !betMeta.optionId) {
      throw new Error('Fixed Odds 模式需要提供 optionId')
    }

    const option = this.options.find((opt) => opt.id === betMeta.optionId)
    if (!option) {
      throw new Error(`無效的選項 ID: ${betMeta.optionId}`)
    }

    // 使用 RNG 判定是否獲勝
    const roll = rng.float(0, 1)
    const isWin = roll < option.winProbability

    return {
      optionId: option.id,
      isWin,
      multiplier: isWin ? option.multiplier : 0,
      description: option.description,
    }
  }

  /* 取得可用選項 */
  getOptions(): IFixedOddsOption[] {
    return this.options
  }
}
