import type { SceneState } from '../models'
/**
 * Scene transition definition
 *
 * Maps from a scene state to valid next states and their trigger events.
 */
export type SceneTransition = {
  readonly from: SceneState
  readonly to: SceneState
  readonly trigger: string
}
/** All valid scene transitions */
export const SCENE_TRANSITIONS: readonly SceneTransition[] = [
  { from: 'idle', to: 'route_selection', trigger: 'start' },
  { from: 'route_selection', to: 'room_preview', trigger: 'route:selected' },
  { from: 'room_preview', to: 'combat', trigger: 'room:entered:combat' },
  { from: 'room_preview', to: 'event', trigger: 'room:entered:event' },
  { from: 'combat', to: 'reward', trigger: 'combat:ended' },
  { from: 'event', to: 'reward', trigger: 'event:resolved' },
  { from: 'reward', to: 'next_floor', trigger: 'reward:claimed' },
  { from: 'reward', to: 'game_over', trigger: 'run:game-over' },
  { from: 'next_floor', to: 'route_selection', trigger: 'floor:changed' },
] as const
