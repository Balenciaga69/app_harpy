import { RunContext } from '../../interfaces/run-context'
/**
 * 關卡協調器
 * 封裝與 Encounter 模組的互動邏輯
 */
export class EncounterCoordinator {
  /**
   * 生成關卡地圖
   */
  generateMap(_context: RunContext): unknown {
    // TODO: 調用 Encounter.generateMap(context.progress.chapter)
    return null // placeholder
  }
  /**
   * 選擇路線
   */
  selectRoute(_context: RunContext, _routeId: string): void {
    // TODO: 調用 Encounter.selectRoute()
  }
  /**
   * 取得當前節點資訊
   */
  getCurrentNode(_context: RunContext): unknown {
    // TODO: 調用 Encounter.getNode()
    return null // placeholder
  }
}
