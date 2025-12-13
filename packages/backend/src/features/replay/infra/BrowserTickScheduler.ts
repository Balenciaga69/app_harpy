import { ITickScheduler, TickCallback } from '../interfaces/tick-scheduler'

/**
 * BrowserTickScheduler
 *
 * 基於瀏覽器的 tick 排程器，使用 requestAnimationFrame。
 * 在瀏覽器環境下提供平滑且與畫面同步的播放。
 */
export class BrowserTickScheduler implements ITickScheduler {
  private animationFrameId: number | null = null
  private callback: TickCallback | null = null
  /** Schedule next tick using requestAnimationFrame */
  public schedule(callback: TickCallback): void {
    this.callback = callback
    this.animationFrameId = requestAnimationFrame((time) => {
      this.animationFrameId = null
      this.callback?.(time)
    })
  }
  /** Cancel scheduled tick */
  public cancel(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.callback = null
  }
  /** Check if tick is scheduled */
  public isScheduled(): boolean {
    return this.animationFrameId !== null
  }
}
