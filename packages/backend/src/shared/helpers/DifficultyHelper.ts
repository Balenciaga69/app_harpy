/**
 * 根據章節、關卡與是否為無盡模式計算難度係數。
 *
 * - 普通模式：每章10關，難度係數線性插值。
 *   - 第1章：1~2.5
 *   - 第2章：2.5~5
 *   - 第3章：5~10
 * - 無盡模式：每10關為一區間，難度係數線性插值。
 *   - 1~10關：1~2.5
 *   - 11~20關：2.5~5
 *   - 21~30關：5~10
 *   - 31~40關：10~20
 *   - 依此類推，每區間難度倍增
 */
function getDifficultyFactor(chapter: number, stage: number): number {
  const isEndless = chapter === 4
  if (!isEndless) {
    // 每章10關，線性插值
    if (chapter === 1) {
      return 1 + ((stage - 1) * (2.5 - 1)) / 9
    }
    if (chapter === 2) {
      return 2.5 + ((stage - 1) * (5 - 2.5)) / 9
    }
    if (chapter === 3) {
      return 5 + ((stage - 1) * (10 - 5)) / 9
    }
  } else {
    // 根據關卡數 (stage) 計算對應的難度數值。
    // 1. 先決定目前屬於哪一個區段 (每10關為一區段)。
    // 2. sectionStart: 取得該區段的起始難度（前6區段用陣列，之後用公式遞增）。
    // 3. sectionEnd: 取得該區段的結束難度（同理，前6區段用陣列，之後用公式）。
    // 4. sectionStage: 計算在區段內的第幾關（0~9）。
    // 5. 回傳該關卡的難度，區段內線性插值（從sectionStart到sectionEnd平均分9份）。
    const section = Math.floor((stage - 1) / 10)
    const sectionStart = [1, 2.5, 5, 10, 20, 40][section] || 10 * Math.pow(2, section - 2)
    const sectionEnd = [2.5, 5, 10, 20, 40, 80][section] || sectionStart * 2
    const sectionStage = (stage - 1) % 10
    return sectionStart + (sectionStage * (sectionEnd - sectionStart)) / 9
  }
  return 1
}

export const DifficultyHelper = {
  getDifficultyFactor,
}
