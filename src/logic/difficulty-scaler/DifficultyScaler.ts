/**
 * 難度係數計算器
 * 負責根據遊戲進度計算當前難度係數
 */
export class DifficultyScaler {
  /**
   * 計算難度係數
   * @param level 關卡層數
   * @param chapter 章節數，預設為 1
   * @returns 難度係數
   */
  calculateDifficulty(level: number, chapter: number = 1): number {
    const baseDifficulty = 1.0
    const levelCoefficient = 0.1
    const chapterCoefficient = 0.5

    return baseDifficulty + levelCoefficient * level + chapterCoefficient * chapter
  }
}
