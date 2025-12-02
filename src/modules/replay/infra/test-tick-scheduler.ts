import type { ITickScheduler, TickCallback } from './tick-scheduler.interface'
/**
 * TestTickScheduler
 *
 * Controllable tick scheduler for testing environments.
 * Allows manual time control without relying on browser APIs.
 */
export class TestTickScheduler implements ITickScheduler {
  private callback: TickCallback | null = null
  private scheduled: boolean = false
  private currentTime: number = 0
  /** Schedule callback for next manual tick */
  public schedule(callback: TickCallback): void {
    this.callback = callback
    this.scheduled = true
  }
  /** Cancel scheduled callback */
  public cancel(): void {
    this.callback = null
    this.scheduled = false
  }
  /** Check if callback is scheduled */
  public isScheduled(): boolean {
    return this.scheduled
  }
  // === Test control methods ===
  /** Manually trigger the next tick with specified time advancement */
  public triggerTick(deltaMs: number = 16): void {
    if (!this.scheduled || !this.callback) {
      return
    }
    this.currentTime += deltaMs
    const cb = this.callback
    this.scheduled = false
    cb(this.currentTime)
  }
  /** Reset internal time counter */
  public resetTime(): void {
    this.currentTime = 0
  }
  /** Get current simulated time */
  public getCurrentTime(): number {
    return this.currentTime
  }
}
