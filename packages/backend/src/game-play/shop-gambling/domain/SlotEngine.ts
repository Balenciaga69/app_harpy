import type {
  ISlotEngine,
  ISlotConfig,
  IReelConfig,
  IPaylineConfig,
  IBetRequest,
  IGamblingConfig,
  ISlotOutcome,
  IRNGService,
} from '../interfaces'

/**
 * 預設 Slot 配置（3 reels, 3 rows, 5 paylines）
 */
const DEFAULT_SLOT_CONFIG: ISlotConfig = {
  reels: [
    {
      id: 0,
      symbols: ['7', 'BAR', 'CHERRY', 'LEMON', 'ORANGE', 'PLUM'],
      weights: [1, 2, 3, 4, 4, 4], // 7 最稀有
    },
    {
      id: 1,
      symbols: ['7', 'BAR', 'CHERRY', 'LEMON', 'ORANGE', 'PLUM'],
      weights: [1, 2, 3, 4, 4, 4],
    },
    {
      id: 2,
      symbols: ['7', 'BAR', 'CHERRY', 'LEMON', 'ORANGE', 'PLUM'],
      weights: [1, 2, 3, 4, 4, 4],
    },
  ],
  paylines: [
    { id: 0, positions: [1, 1, 1] }, // 中線
    { id: 1, positions: [0, 0, 0] }, // 上線
    { id: 2, positions: [2, 2, 2] }, // 下線
    { id: 3, positions: [0, 1, 2] }, // 對角線 \
    { id: 4, positions: [2, 1, 0] }, // 對角線 /
  ],
  wildSymbols: [], // 暫時沒有 wild
  scatterSymbols: [], // 暫時沒有 scatter
}

/**
 * Slot 引擎實作
 */
export class SlotEngine implements ISlotEngine {
  private slotConfig: ISlotConfig

  constructor(slotConfig: ISlotConfig = DEFAULT_SLOT_CONFIG) {
    this.slotConfig = slotConfig
  }

  /* 執行 spin */
  spin(betRequest: IBetRequest, rng: IRNGService, config: IGamblingConfig): ISlotOutcome {
    // 生成 reel 結果（3 reels × 3 rows）
    const reelSymbols: string[][] = this.slotConfig.reels.map((reel) => this.spinReel(reel, rng, 3))

    // 評估贏線
    const winLines = this.evaluateWinLines(reelSymbols, config)

    // 計算總倍數
    const totalMultiplier = winLines.reduce((sum, line) => sum + line.multiplier, 0)

    return {
      reelSymbols,
      winLines,
      totalMultiplier,
    }
  }

  /* 取得 Slot 配置 */
  getSlotConfig(): ISlotConfig {
    return this.slotConfig
  }

  /* Spin 單一 reel */
  private spinReel(reel: IReelConfig, rng: IRNGService, count: number): string[] {
    const results: string[] = []
    for (let i = 0; i < count; i++) {
      if (reel.weights) {
        results.push(rng.weighted(reel.symbols, reel.weights))
      } else {
        results.push(rng.pick(reel.symbols))
      }
    }
    return results
  }

  /* 評估贏線 */
  private evaluateWinLines(
    reelSymbols: string[][],
    config: IGamblingConfig
  ): Array<{ lineId: number; symbols: string[]; multiplier: number }> {
    const winLines: Array<{
      lineId: number
      symbols: string[]
      multiplier: number
    }> = []

    for (const payline of this.slotConfig.paylines) {
      const symbols = payline.positions.map((pos, reelIndex) => reelSymbols[reelIndex][pos])

      const multiplier = this.checkLineWin(symbols, config)
      if (multiplier > 0) {
        winLines.push({
          lineId: payline.id,
          symbols,
          multiplier,
        })
      }
    }

    return winLines
  }

  /* 檢查 line 是否獲勝 */
  private checkLineWin(symbols: string[], config: IGamblingConfig): number {
    // 檢查三個相同
    if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
      const condition = `three_${symbols[0].toLowerCase()}s`
      const entry = config.payoutTable.find((e) => e.condition === condition)
      if (entry) {
        return entry.multiplier
      }
    }

    // 檢查兩個相同（特定符號）
    if (symbols[0] === symbols[1] && symbols[0] === 'CHERRY') {
      const entry = config.payoutTable.find((e) => e.condition === 'two_cherries')
      if (entry) {
        return entry.multiplier
      }
    }

    // 檢查單個（特定符號）
    if (symbols[0] === 'CHERRY') {
      const entry = config.payoutTable.find((e) => e.condition === 'one_cherry')
      if (entry) {
        return entry.multiplier
      }
    }

    return 0
  }
}
