/**
 * Scene State
 *
 * Represents all possible scene states in the run state machine.
 */
export type SceneState =
  | 'idle'
  | 'route_selection'
  | 'room_preview'
  | 'combat'
  | 'event'
  | 'reward'
  | 'next_floor'
  | 'game_over'
