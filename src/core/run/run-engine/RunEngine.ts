import { nanoid } from 'nanoid'
import { RunStateMachine } from '../core/RunStateMachine'
import type { IRunEventBus } from '../infra/event-bus'
import { ChapterManager } from '../managers/ChapterManager'
import { FloorManager } from '../managers/FloorManager'
import type { RouteInfo, RunState, ShopRoomData } from '../models'
import type { RunConfig } from '../infra/configs'
/**
 * 執行引擎（Run Engine）
 *
 * 薄型外觀（thin facade），協調執行流程進行。
 * 只負責三件事：
 * 1. 維護 floor/chapter 進度
 * 2. 提供路線選擇
 * 3. 驅動場景狀態機
 *
 * 所有商業邏輯由外部 handler 透過事件觸發處理。
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
  /** 使用可選配置啟動新的執行（run） */
  start(config: RunConfig = {}): void {
    this.seed = config.seed ?? nanoid(8)
    this.floorManager.reset(config.startFloor ?? 1)
    this.chapterManager.reset()
    // 從 idle 狀態切換到 route_selection
    this.stateMachine.transition('start')
    // 發送 run:started 事件
    this.eventBus.emit('run:started', {
      seed: this.seed,
      floor: this.floorManager.getFloor(),
    })
    // 為第一章生成路線選項
    // TODO: 根據 seed 生成實際路線
    //   - 路線可能包含 `shop`/`bet` 節點，需保證 seed 下的確定性
    //   - pre-battle modifiers 應由 ModifierHandler 生成（非 RunEngine），並由 CombatHandler 消費
    this.generateRouteOptions()
  }
  /** 載入已存的執行狀態（run state） */
  load(state: RunState): void {
    this.seed = state.seed
    this.stateMachine.setState(state.scene)
    this.floorManager.setFloor(state.floor)
    this.chapterManager.setState(state.currentRoute, state.roomIndex, [...state.routeOptions])
    this.eventBus.emit('run:loaded', { runState: state })
  }
  /** 取得當前執行狀態（可序列化） */
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
  /** 以索引選擇路線 */
  selectRoute(index: number): void {
    const route = this.chapterManager.selectRoute(index)
    if (!route) return
    // 轉換到 room_preview
    this.stateMachine.transition('route:selected')
    this.eventBus.emit('route:selected', {
      routeIndex: index,
      rooms: route.rooms,
    })
    // 若路線以商店開始，發出 'shop:entered' 以便 ShopHandler 立即顯示商店或投注 UI
    if (route.rooms?.[0]?.type === 'shop') {
      this.eventBus.emit('shop:entered', {
        seed: this.seed,
        chapter: this.floorManager.getChapter(),
        shopId: (route.rooms[0].data as ShopRoomData).shopId,
      })
    }
  }
  /** 進入當前房間 */
  enterRoom(): void {
    const room = this.chapterManager.getCurrentRoom()
    if (!room) return
    // 根據房間類型決定觸發器（將 'shop' 當作 'event' 場景處理）
    const trigger = room.type === 'event' || room.type === 'shop' ? 'room:entered:event' : 'room:entered:combat'
    // TODO: 若 UI 或其他 handlers 需注入 pre-battle 投注或修飾器（modifiers），
    //       確保這些事件在 'room:entered' 之前發生，或在 CombatHandler 執行 CombatEngine 前完成。
    //       範例：發出 'pre_battle:applied' 並允許 BetHandler 解析下注
    this.stateMachine.transition(trigger)
    this.eventBus.emit('room:entered', {
      roomType: room.type,
      roomData: room,
    })
    // 若房間為商店，發出商店專用事件讓 ShopHandler 接手處理
    if (room.type === 'shop') {
      this.eventBus.emit('shop:entered', {
        seed: this.seed,
        chapter: this.floorManager.getChapter(),
        shopId: (room.data as ShopRoomData).shopId,
      })
    }
  }
  /** 推進到下一層樓（由 handler 在房間完成後呼叫） */
  advanceFloor(): void {
    const result = this.floorManager.advanceFloor()
    // 切換到 route_selection
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
    // 生成新一輪的路線選項
    this.generateRouteOptions()
  }
  /** 結束執行（遊戲結束） */
  gameOver(): void {
    this.stateMachine.transition('run:game-over')
    this.eventBus.emit('run:game-over', {
      floor: this.floorManager.getFloor(),
      chapter: this.floorManager.getChapter(),
    })
  }
  /** 清理資源 */
  dispose(): void {
    this.eventBus.clear()
    this.stateMachine.reset()
    this.floorManager.reset()
    this.chapterManager.reset()
  }
  /** 為當前章節生成路線選項（示範占位） */
  private generateRouteOptions(): void {
    // TODO: 根據 seed 與章節實作真正的路線生成
    // 此為示範占位，會建立空的路線選項
    const routes: RouteInfo[] = []
    const routeCount = this.chapterManager.getRoutesPerChapter()
    for (let i = 0; i < routeCount; i++) {
      routes.push({
        id: `route-${this.floorManager.getChapter()}-${i}`,
        rooms: [], // TODO: 生成實際的房間（rooms）
      })
    }
    this.chapterManager.setRouteOptions(routes)
  }
}
