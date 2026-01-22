function getDifficultyFactor(chapter: number, stage: number): number {
  const isEndless = chapter === 4
  if (isEndless) {
    const section = Math.floor((stage - 1) / 10)
    const sectionStart = [1, 2.5, 5, 10, 20, 40][section] || 10 * Math.pow(2, section - 2)
    const sectionEnd = [2.5, 5, 10, 20, 40, 80][section] || sectionStart * 2
    const sectionStage = (stage - 1) % 10
    return sectionStart + (sectionStage * (sectionEnd - sectionStart)) / 9
  } else {
    if (chapter === 1) {
      return 1 + ((stage - 1) * (2.5 - 1)) / 9
    }
    if (chapter === 2) {
      return 2.5 + ((stage - 1) * (5 - 2.5)) / 9
    }
    if (chapter === 3) {
      return 5 + ((stage - 1) * (10 - 5)) / 9
    }
  }
  return 1
}
export const DifficultyHelper = {
  getDifficultyFactor,
}
