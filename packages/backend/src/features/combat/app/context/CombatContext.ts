import { ICharacter } from '../../interfaces/character/ICharacter'
import { ICombatContext } from '../../interfaces/context/ICombatContext'
import { ICombatEventBus } from '../../interfaces/event-bus/ICombatEventBus'
import { IResourceRegistry } from '../../interfaces/resource-registry/IResourceRegistry'
import { IEntity } from '../../interfaces/shared/IEntity'
import { CombatRandomGenerator } from '../shared/utils/CombatRandomGenerator'
import { isCharacter } from '../shared/utils/TypeGuardUtil'
import { BattleState } from './BattleState'
/**
 * 戰鬥上下文 (CombatContext)
 *
 * 戰鬥基礎設施的全域資源容器。
 * 組合了 BattleState 用於實體/時間步管理，分離關注點：
 * - CombatContext: 基礎設施 (事件總線、隨機數生成器、資源註冊表)
 * - BattleState: 領域狀態 (實體、時間步)
 *
 * 將實體/時間步操作委派給 BattleState，同時處理
 * 用於角色查找的註冊表同步。
 */
export class CombatContext implements ICombatContext {
  public readonly eventBus: ICombatEventBus
  public readonly rng: CombatRandomGenerator
  public readonly registry: IResourceRegistry
  private readonly battleState: BattleState
  constructor(eventBus: ICombatEventBus, registry: IResourceRegistry, seed?: string | number) {
    this.eventBus = eventBus
    this.rng = new CombatRandomGenerator(seed)
    this.registry = registry
    this.battleState = new BattleState()
  }
  // === Entity ===
  public getEntity(id: string): IEntity | undefined {
    return this.battleState.getEntity(id)
  }
  public addEntity(entity: IEntity): void {
    this.battleState.addEntity(entity)
    // Sync character to registry for ID-based lookups
    if (isCharacter(entity)) {
      this.registry.registerCharacter(entity as ICharacter)
    }
  }
  public removeEntity(id: string): void {
    const entity = this.battleState.removeEntity(id)
    // Sync removal from registry
    if (entity && isCharacter(entity)) {
      this.registry.unregisterCharacter(id)
    }
  }
  public getAllEntities(): readonly IEntity[] {
    return this.battleState.getAllEntities()
  }
  public getEntitiesByTeam(team: IEntity['team']): readonly IEntity[] {
    return this.battleState.getEntitiesByTeam(team)
  }
  // === Tick ===
  public getCurrentTick(): number {
    return this.battleState.getCurrentTick()
  }
  public incrementTick(): void {
    this.battleState.incrementTick()
  }
  public resetTick(): void {
    this.battleState.resetTick()
  }
}
