/**
 * Important moment on the timeline
 */
export interface TimelineMoment {
  /** Tick when this moment occurs */
  tick: number
  /** Type of moment (ultimate, death, critical, etc) */
  type: string
  /** Optional label for display */
  label?: string
}
