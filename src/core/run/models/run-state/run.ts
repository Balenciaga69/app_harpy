import type { RouteInfo } from './route.ts'
import type { SceneState } from '../scene-state'
/**
 * Run State
 *
 * Pure data object representing current run progress.
 * Fully serializable for save/load functionality.
 */
export type RunState = {
  readonly floor: number
  readonly chapter: number
  readonly scene: SceneState
  readonly currentRoute: RouteInfo | null
  readonly routeOptions: readonly RouteInfo[]
  readonly roomIndex: number
  readonly seed: string
}
