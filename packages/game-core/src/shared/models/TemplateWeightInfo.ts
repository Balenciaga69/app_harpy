export interface TemplateWeightInfo {
  templateId: string
  weight: number
}
export interface WithChapter {
  chapters: Array<ChapterLevel>
}
export type ChapterLevel = 1 | 2 | 3
