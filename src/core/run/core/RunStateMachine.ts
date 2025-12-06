import type { SceneState } from '../models'
import { SCENE_TRANSITIONS } from './scene-transition'
/**
 * Run State Machine
 *
 * Manages scene state transitions during a run.
 * Validates transitions and provides current state information.
 */
export class RunStateMachine {
  private currentState: SceneState = 'idle'
  /** Get current scene state */
  getState(): SceneState {
    return this.currentState
  }
  /** Check if a transition is valid from current state */
  canTransition(trigger: string): boolean {
    return SCENE_TRANSITIONS.some((t) => t.from === this.currentState && t.trigger === trigger)
  }
  /** Attempt to transition to a new state */
  transition(trigger: string): boolean {
    const transition = SCENE_TRANSITIONS.find((t) => t.from === this.currentState && t.trigger === trigger)
    if (!transition) {
      return false
    }
    this.currentState = transition.to
    return true
  }
  /** Force set state (for loading saved games) */
  setState(state: SceneState): void {
    this.currentState = state
  }
  /** Reset to idle state */
  reset(): void {
    this.currentState = 'idle'
  }
  /** Check if run is in a terminal state */
  isTerminal(): boolean {
    return this.currentState === 'game_over' || this.currentState === 'idle'
  }
}
