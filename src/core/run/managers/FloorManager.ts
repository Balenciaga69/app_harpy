import { type RunConfig, DEFAULT_RUN_CONFIG } from '../infra/configs'
/**
 * Floor Manager
 *
 * Manages floor and chapter progression during a run.
 * Pure data manager with no side effects.
 */
export class FloorManager {
  // TODO: Validate startFloor and maxFloors; consider exposing hooks/events for 'floor advanced' edge cases
  // TODO: Support 'endless' mode toggling and ensure floor/chapter math is stable for large numbers
  private floor: number
  private chapter: number
  private readonly floorsPerChapter: number
  private readonly maxFloors: number
  constructor(config: RunConfig = {}) {
    const merged = { ...DEFAULT_RUN_CONFIG, ...config }
    this.floor = merged.startFloor
    this.chapter = this.calculateChapter(merged.startFloor)
    this.floorsPerChapter = merged.floorsPerChapter
    this.maxFloors = merged.maxFloors
  }
  /** Get current floor number */
  getFloor(): number {
    return this.floor
  }
  /** Get current chapter number */
  getChapter(): number {
    return this.chapter
  }
  /** Advance to next floor, returns true if chapter changed */
  advanceFloor(): { newFloor: number; newChapter: number; chapterChanged: boolean } {
    this.floor++
    const newChapter = this.calculateChapter(this.floor)
    const chapterChanged = newChapter !== this.chapter
    this.chapter = newChapter
    return {
      newFloor: this.floor,
      newChapter: this.chapter,
      chapterChanged,
    }
  }
  /** Check if current floor is a boss floor */
  isBossFloor(): boolean {
    const positionInChapter = this.floor % this.floorsPerChapter
    return positionInChapter === 5 || positionInChapter === 0
  }
  /** Check if current floor is the final boss of a chapter */
  isChapterBoss(): boolean {
    return this.floor % this.floorsPerChapter === 0
  }
  /** Check if in endless mode (beyond max floors) */
  isEndlessMode(): boolean {
    return this.floor > this.maxFloors
  }
  /** Set floor directly (for loading saved games) */
  setFloor(floor: number): void {
    this.floor = floor
    this.chapter = this.calculateChapter(floor)
  }
  /** Reset to starting floor */
  reset(startFloor: number = 1): void {
    this.floor = startFloor
    this.chapter = this.calculateChapter(startFloor)
  }
  private calculateChapter(floor: number): number {
    return Math.ceil(floor / this.floorsPerChapter)
  }
}
