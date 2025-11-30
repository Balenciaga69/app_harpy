import type { CombatContext } from '../context'
import type { CombatSnapshot } from '../combat-engine/models'
import { isCharacter } from '../shared'
import type { ICharacter } from '../character'
/**
 * SnapshotCollector：戰鬥快照收集器。
 *
 * 設計理念：
 * - 單一職責：只負責監聽事件並實時收集戰鬥狀態快照。
 * - 事件驅動：透過 EventBus 接收採集時機通知，不主動輪詢。
 * - 數據真實性：直接讀取當下的實體狀態，確保快照準確反映戰鬥進程。
 * - 可配置間隔：支援靈活的採集頻率設定，平衡性能與回放精度。
 * - 職責分離：僅負責收集，不參與戰鬥邏輯或結果構建。
 *
 * 主要職責：
 * - 監聽 tick:start 事件，判斷是否達到採集間隔。
 * - 從 CombatContext 讀取所有實體的當前狀態。
 * - 生成並儲存包含真實時間戳的快照物件。
 * - 提供快照查詢介面供 ResultBuilder 使用。
 * - 提供資源清理方法，在戰鬥結束後釋放記憶體。
 */
export class SnapshotCollector {
  private snapshots: CombatSnapshot[] = []
  private interval: number
  private context: CombatContext
  constructor(context: CombatContext, interval: number = 100) {
    this.context = context
    this.interval = interval
    this.registerEventListeners()
  }
  /** 註冊事件監聽 */
  private registerEventListeners(): void {
    this.context.eventBus.on('tick:start', (payload) => {
      if (payload.tick % this.interval === 0) {
        this.captureSnapshot(payload.tick)
      }
    })
  }
  /** 捕捉當前戰鬥狀態快照 */
  private captureSnapshot(tick: number): void {
    const allEntities = this.context.getAllEntities()
    const snapshot: CombatSnapshot = {
      tick,
      characters: allEntities.filter(isCharacter).map((character: ICharacter) => ({
        id: character.id,
        name: character.name,
        currentHp: character.getAttribute('currentHp'),
        maxHp: character.getAttribute('maxHp'),
        isDead: character.isDead,
        effects: character.getAllEffects().map((effect) => effect.name),
      })),
    }
    this.snapshots.push(snapshot)
  }
  /** 獲取所有已收集的快照 */
  public getSnapshots(): CombatSnapshot[] {
    return this.snapshots
  }
  /** 清理資源 */
  public dispose(): void {
    this.snapshots = []
  }
}
