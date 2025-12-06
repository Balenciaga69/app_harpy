import { nanoid } from 'nanoid'
import { RunStateMachine } from '../core/RunStateMachine'
import type { IRunEventBus } from '../infra/event-bus/event-bus'
import { ChapterManager } from '../managers/ChapterManager'
import { FloorManager } from '../managers/FloorManager'
import type { RouteInfo, RunConfig, RunState } from '../models'
/**
 * Run Engine
 *
 * Thin facade that coordinates run progression.
 * Only does three things:
 * 1. Maintain floor/chapter progress
 * 2. Provide route selection
 * 3. Drive scene state machine
 *
 * All business logic is handled by external handlers via events.
 */
export class RunEngine {
  private readonly eventBus: IRunEventBus
  private readonly stateMachine: RunStateMachine
  private readonly floorManager: FloorManager
  private readonly chapterManager: ChapterManager
  private seed: string = ''
  constructor(eventBus: IRunEventBus) {
    this.eventBus = eventBus
    this.stateMachine = new RunStateMachine()
    this.floorManager = new FloorManager()
    this.chapterManager = new ChapterManager()
  }
  /** Start a new run with optional configuration */
  start(config: RunConfig = {}): void {
    this.seed = config.seed ?? nanoid(8)
    this.floorManager.reset(config.startFloor ?? 1)
    this.chapterManager.reset()
    // Transition from idle to route_selection
    this.stateMachine.transition('start')
    // Emit run started event
    this.eventBus.emit('run:started', {
      seed: this.seed,
      floor: this.floorManager.getFloor(),
    })
    // Generate route options for first chapter
    // TODO: Generate actual routes based on seed
    this.generateRouteOptions()
  }
  /** Load a saved run state */
  load(state: RunState): void {
    this.seed = state.seed
    this.stateMachine.setState(state.scene)
    this.floorManager.setFloor(state.floor)
    this.chapterManager.setState(state.currentRoute, state.roomIndex, [...state.routeOptions])
    this.eventBus.emit('run:loaded', { runState: state })
  }
  /** Get current run state (serializable) */
  getState(): RunState {
    return {
      floor: this.floorManager.getFloor(),
      chapter: this.floorManager.getChapter(),
      scene: this.stateMachine.getState(),
      currentRoute: this.chapterManager.getCurrentRoute(),
      routeOptions: this.chapterManager.getRouteOptions(),
      roomIndex: this.chapterManager.getRoomIndex(),
      seed: this.seed,
    }
  }
  /** Select a route by index */
  selectRoute(index: number): void {
    const route = this.chapterManager.selectRoute(index)
    if (!route) return
    // Transition to room_preview
    this.stateMachine.transition('route:selected')
    this.eventBus.emit('route:selected', {
      routeIndex: index,
      rooms: route.rooms,
    })
  }
  /** Enter the current room */
  enterRoom(): void {
    const room = this.chapterManager.getCurrentRoom()
    if (!room) return
    // Determine transition trigger based on room type
    const trigger = room.type === 'event' ? 'room:entered:event' : 'room:entered:combat'
    this.stateMachine.transition(trigger)
    this.eventBus.emit('room:entered', {
      roomType: room.type,
      roomData: room,
    })
  }
  /** Advance to next floor (called by handlers after room complete) */
  advanceFloor(): void {
    const result = this.floorManager.advanceFloor()
    // Transition to route_selection
    this.stateMachine.transition('floor:changed')
    this.eventBus.emit('floor:changed', {
      floor: result.newFloor,
      chapter: result.newChapter,
    })
    if (result.chapterChanged) {
      this.eventBus.emit('chapter:changed', {
        chapter: result.newChapter,
      })
    }
    // Generate new route options
    this.generateRouteOptions()
  }
  /** End the run (game over) */
  gameOver(): void {
    this.stateMachine.transition('run:game-over')
    this.eventBus.emit('run:game-over', {
      floor: this.floorManager.getFloor(),
      chapter: this.floorManager.getChapter(),
    })
  }
  /** Clean up resources */
  dispose(): void {
    this.eventBus.clear()
    this.stateMachine.reset()
    this.floorManager.reset()
    this.chapterManager.reset()
  }
  /** Generate route options for current chapter (placeholder) */
  private generateRouteOptions(): void {
    // TODO: Implement actual route generation based on seed and chapter
    // This is a placeholder that creates empty route options
    const routes: RouteInfo[] = []
    const routeCount = this.chapterManager.getRoutesPerChapter()
    for (let i = 0; i < routeCount; i++) {
      routes.push({
        id: `route-${this.floorManager.getChapter()}-${i}`,
        rooms: [], // TODO: Generate actual rooms
      })
    }
    this.chapterManager.setRouteOptions(routes)
  }
}
