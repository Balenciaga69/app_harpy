/**
 * 準備生成的相關資訊
 */
export interface TemplateWeightInfo {
  templateId: string
  weight: number
}

/**
 * 含有關卡的介面
 */
export interface WithChapter {
  chapters: Array<ChapterLevel>
}

export type ChapterLevel = 1 | 2 | 3
