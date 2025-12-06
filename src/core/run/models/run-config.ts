/**
 * Run Config
 *
 * Configuration for starting a new run.
 */
export type RunConfig = {
  readonly seed?: string
  readonly startFloor?: number
  readonly routesPerChapter?: number
  readonly floorsPerChapter?: number
  readonly maxFloors?: number
}
/** Default run configuration values */
export const DEFAULT_RUN_CONFIG: Required<RunConfig> = {
  seed: '',
  startFloor: 1,
  routesPerChapter: 3,
  floorsPerChapter: 10,
  maxFloors: 30,
} as const
