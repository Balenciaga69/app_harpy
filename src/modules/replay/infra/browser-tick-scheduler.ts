import type { ITickScheduler, TickCallback } from './tick-scheduler.interface'
/**
 * BrowserTickScheduler
 *
 * Browser-based tick scheduler using requestAnimationFrame.
 * Provides smooth frame-synchronized playback in browser environments.
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
