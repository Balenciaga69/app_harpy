import { type RunConfig, DEFAULT_RUN_CONFIG } from '../infra/configs'
import type { RoomInfo, RouteInfo } from '../models'
/**
 * Chapter Manager
 *
 * Manages route generation and room navigation within a chapter.
 * Uses provided RNG for deterministic route generation.
 */
export class ChapterManager {
  private routeOptions: RouteInfo[] = []
  private currentRoute: RouteInfo | null = null
  private roomIndex: number = 0
  private readonly _routesPerChapter: number
  constructor(config: RunConfig = {}) {
    const merged = { ...DEFAULT_RUN_CONFIG, ...config }
    this._routesPerChapter = merged.routesPerChapter
  }
  /** Get number of routes per chapter */
  getRoutesPerChapter(): number {
    return this._routesPerChapter
  }
  /** Get available route options */
  getRouteOptions(): readonly RouteInfo[] {
    return this.routeOptions
  }
  /** Get currently selected route */
  getCurrentRoute(): RouteInfo | null {
    return this.currentRoute
  }
  /** Get current room index in the route */
  getRoomIndex(): number {
    return this.roomIndex
  }
  /** Get current room info */
  getCurrentRoom(): RoomInfo | null {
    if (!this.currentRoute) return null
    return this.currentRoute.rooms[this.roomIndex] ?? null
  }
  /** Set route options (called when entering route selection) */
  setRouteOptions(routes: RouteInfo[]): void {
    this.routeOptions = routes
    this.currentRoute = null
    this.roomIndex = 0
  }
  /** Select a route by index */
  selectRoute(index: number): RouteInfo | null {
    if (index < 0 || index >= this.routeOptions.length) {
      return null
    }
    this.currentRoute = this.routeOptions[index] ?? null
    this.roomIndex = 0
    return this.currentRoute
  }
  /** Advance to next room in current route */
  advanceRoom(): RoomInfo | null {
    if (!this.currentRoute) return null
    if (this.roomIndex >= this.currentRoute.rooms.length - 1) {
      return null // No more rooms
    }
    this.roomIndex++
    return this.getCurrentRoom()
  }
  /** Check if at end of current route */
  isRouteComplete(): boolean {
    if (!this.currentRoute) return false
    return this.roomIndex >= this.currentRoute.rooms.length - 1
  }
  /** Reset for new chapter */
  reset(): void {
    this.routeOptions = []
    this.currentRoute = null
    this.roomIndex = 0
  }
  /** Set state directly (for loading saved games) */
  setState(route: RouteInfo | null, roomIndex: number, options: RouteInfo[]): void {
    this.currentRoute = route
    this.roomIndex = roomIndex
    this.routeOptions = options
  }
}
