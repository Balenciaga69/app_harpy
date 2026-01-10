/**
 * 遭遇戰上下文
 *
 * 包含即將進入的節點摘要與難度資訊
 */
export interface IEncounterContext {
  /** 節點 ID */
  nodeId: string
  /** 威脅等級（1-10） */
  threatLevel: number
  /** 難度係數 */
  difficultyCoefficient: number
  /** 章節號 */
  chapterNumber: number
  /** 關卡層數 */
  floorNumber: number
  /** 節點類型 */
  nodeType: 'combat' | 'boss' | 'elite'
}
