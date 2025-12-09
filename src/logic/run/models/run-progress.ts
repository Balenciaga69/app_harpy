/**
 * Run 的進度資訊
 */
export interface RunProgress {
  /** 當前章節（每 10 關為一章） */
  chapter: number
  /** 當前節點（1-10） */
  node: number
  /** 總關卡數 */
  totalNodesCleared: number
  /** 是否進入無盡模式 */
  isEndlessMode: boolean
  /** 難度係數 */
  difficultyScale: number
}
/**
 * 建立初始進度
 */
export function createInitialProgress(): RunProgress {
  return {
    chapter: 1,
    node: 1,
    totalNodesCleared: 0,
    isEndlessMode: false,
    difficultyScale: 1.0,
  }
}
/**
 * 推進到下一節點
 */
export function advanceProgress(progress: RunProgress): RunProgress {
  const newTotalNodes = progress.totalNodesCleared + 1
  const newNode = (progress.node % 10) + 1
  const newChapter = newNode === 1 ? progress.chapter + 1 : progress.chapter
  const isEndless = newTotalNodes > 30
  return {
    chapter: newChapter,
    node: newNode,
    totalNodesCleared: newTotalNodes,
    isEndlessMode: isEndless,
    difficultyScale: calculateDifficultyScale(newTotalNodes),
  }
}
/**
 * 計算難度係數
 */
function calculateDifficultyScale(totalNodes: number): number {
  // 簡單的線性成長，可依需求調整
  return 1.0 + totalNodes * 0.1
}
