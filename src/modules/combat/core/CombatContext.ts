import type { ICharacter } from '../character'
import { EventBus } from '../event'
import { CombatRandomGenerator, type IEntity } from '../shared'
/**
 * CombatContext：戰鬥的全域上下文容器。
 *
 * 設計理念：
 * - 作為貧血模型（Anemic Model），僅承載共享資料與訪問接口，不包含業務邏輯。
 * - 提供 EventBus、RNG 與 Entity 管理等核心資源，供多個系統共用。
 * - 最小化耦合，系統（如 DamageChain、Ticker）透過 Context 訪問共用資源。
 *
 * 主要職責：
 * - 持有戰鬥的事件總線（EventBus）與隨機數生成器（CombatRandomGenerator）。
 * - 管理參與戰鬥的實體列表（Entity 管理）。
 * - 提供當前 Tick 的讀寫接口，方便其他系統基於時間驅動執行。
 * - 提供工具性的方法（如 isCharacter）以支援系統層判斷。
 */
export class CombatContext {
  public readonly eventBus: EventBus
  public readonly rng: CombatRandomGenerator
  private currentTick: number = 0
  private entities: Map<string, IEntity> = new Map()
  constructor(seed?: string | number) {
    this.eventBus = new EventBus()
    this.rng = new CombatRandomGenerator(seed)
  }
  // ===Entity===
  public getEntity(id: string): IEntity | undefined {
    return this.entities.get(id)
  }
  public addEntity(entity: IEntity): void {
    this.entities.set(entity.id, entity)
  }
  public removeEntity(id: string): void {
    this.entities.delete(id)
  }
  public getAllEntities(): readonly IEntity[] {
    return Array.from(this.entities.values())
  }
  public getEntitiesByTeam(team: IEntity['team']): IEntity[] {
    return this.getAllEntities().filter((e) => (e as IEntity).team === team)
  }
  public isCharacter(entity: unknown): entity is ICharacter {
    return (
      typeof entity === 'object' &&
      entity !== null &&
      'getAttribute' in entity &&
      typeof (entity as Record<string, unknown>).getAttribute === 'function'
    )
  }
  // ===Tick===
  public getCurrentTick(): number {
    return this.currentTick
  }
  public incrementTick(): void {
    this.currentTick++
  }
  public resetTick(): void {
    this.currentTick = 0
  }
  // 這裡可以加入更多戰鬥全域資訊，如 RNG 種子、戰鬥設定等
}
